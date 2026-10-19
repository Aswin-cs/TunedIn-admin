import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Backblaze B2 Configuration for TunedIn Admin
 * Uses the S3-compatible API for scalable, reliable song audio uploading & streaming.
 */

const region =
  process.env.BACKBLAZE_REGION ||
  process.env.B2_REGION ||
  "us-east-005";

const endpoint =
  process.env.BACKBLAZE_ENDPOINT ||
  process.env.B2_ENDPOINT ||
  `https://s3.${region}.backblazeb2.com`;

const keyId =
  process.env.BACKBLAZE_APPLICATION_KEY_ID ||
  process.env.BACKBLAZE_KEY_ID ||
  process.env.B2_APPLICATION_KEY_ID ||
  "";

const applicationKey =
  process.env.BACKBLAZE_APPLICATION_KEY ||
  process.env.B2_APPLICATION_KEY ||
  "";

const bucketName =
  process.env.BACKBLAZE_BUCKET_NAME ||
  process.env.B2_BUCKET_NAME ||
  "";

// Optional custom CDN / domain (e.g. Cloudflare or friendly domain)
const customDomain = process.env.BACKBLAZE_CUSTOM_DOMAIN;

export const backblazeConfig = {
  region,
  endpoint,
  keyId,
  applicationKey,
  bucketName,
  customDomain,
};

/**
 * Backblaze B2 S3 Client instance
 */
export const b2Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: keyId,
    secretAccessKey: applicationKey,
  },
  forcePathStyle: false, // Backblaze B2 supports virtual-hosted style requests
});

/**
 * Check if Backblaze B2 credentials and bucket are configured in environment
 */
export function isBackblazeConfigured(): boolean {
  return Boolean(keyId && applicationKey && bucketName);
}

export interface AudioUploadParams {
  /** The audio file buffer to upload */
  fileBuffer: Buffer | Uint8Array;
  /** Original or desired filename (e.g. "track-01.mp3") */
  fileName: string;
  /** Audio MIME type (e.g. "audio/mpeg", "audio/wav", "audio/flac", "audio/aac") */
  mimeType?: string;
  /** Storage subfolder (defaults to "tunedin/audio") */
  folder?: string;
  /** Optional metadata tags */
  metadata?: Record<string, string>;
}

export interface AudioUploadResult {
  /** The publicly accessible or streamable URL of the uploaded audio */
  audioUrl: string;
  /** Storage key in Backblaze bucket */
  key: string;
  /** File size in bytes */
  size: number;
  /** Bucket where the file was saved */
  bucket: string;
  /** Content-Type of the audio */
  contentType: string;
}

/**
 * Helper to determine audio MIME type from file extension
 */
export function detectAudioMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "flac":
      return "audio/flac";
    case "aac":
      return "audio/aac";
    case "ogg":
    case "oga":
      return "audio/ogg";
    case "m4a":
      return "audio/mp4";
    case "weba":
    case "webm":
      return "audio/webm";
    default:
      return "audio/mpeg";
  }
}

/**
 * Construct public streaming URL for a given Backblaze B2 key
 */
export function getBackblazePublicUrl(key: string): string {
  if (customDomain) {
    const cleanDomain = customDomain.replace(/\/+$/, "");
    return `${cleanDomain}/${key}`;
  }
  return `https://${bucketName}.s3.${region}.backblazeb2.com/${key}`;
}

/**
 * Upload an audio file directly to Backblaze B2.
 *
 * @param params - Audio file buffer, file name, and optional parameters
 * @returns Promise<AudioUploadResult>
 */
export async function uploadAudio({
  fileBuffer,
  fileName,
  mimeType,
  folder = "tunedin/audio",
  metadata = {},
}: AudioUploadParams): Promise<AudioUploadResult> {
  if (!isBackblazeConfigured()) {
    throw new Error(
      "Backblaze B2 is not configured. Please set BACKBLAZE_APPLICATION_KEY_ID, BACKBLAZE_APPLICATION_KEY, and BACKBLAZE_BUCKET_NAME in your environment variables."
    );
  }

  const contentType = mimeType || detectAudioMimeType(fileName);

  // Sanitize filename and create unique storage key
  const sanitizedName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_");
  const uniqueKey = `${folder}/${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    Body: fileBuffer,
    ContentType: contentType,
    ContentDisposition: "inline", // Allows in-browser audio streaming
    Metadata: metadata,
  });

  await b2Client.send(command);

  const audioUrl = getBackblazePublicUrl(uniqueKey);

  return {
    audioUrl,
    key: uniqueKey,
    size: fileBuffer.length,
    bucket: bucketName,
    contentType,
  };
}

/**
 * Generate a pre-signed GET URL for secure streaming or downloading from private buckets.
 *
 * @param key - The Backblaze storage key of the audio file
 * @param expiresInSeconds - Expiration time in seconds (default: 3600 / 1 hour)
 */
export async function getAudioPresignedUrl(
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!isBackblazeConfigured()) {
    throw new Error("Backblaze B2 is not configured in environment variables.");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(b2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a pre-signed PUT URL to allow direct browser-to-B2 uploads
 * (bypassing Next.js API route payload memory limits for large audio files).
 *
 * @param fileName - Original name of the audio file
 * @param mimeType - Audio mime type
 * @param expiresInSeconds - URL validity window in seconds (default: 900 / 15 minutes)
 */
export async function getAudioUploadPresignedUrl(
  fileName: string,
  mimeType?: string,
  expiresInSeconds: number = 900
): Promise<{ uploadUrl: string; key: string; audioUrl: string }> {
  if (!isBackblazeConfigured()) {
    throw new Error("Backblaze B2 is not configured in environment variables.");
  }

  const contentType = mimeType || detectAudioMimeType(fileName);
  const sanitizedName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_");
  const key = `tunedin/audio/${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ContentDisposition: "inline",
  });

  const uploadUrl = await getSignedUrl(b2Client, command, { expiresIn: expiresInSeconds });
  const audioUrl = getBackblazePublicUrl(key);

  return { uploadUrl, key, audioUrl };
}

/**
 * Delete an audio file from Backblaze B2 bucket by key.
 *
 * @param key - The Backblaze storage key
 */
export async function deleteAudio(key: string): Promise<{ success: boolean; key: string }> {
  if (!isBackblazeConfigured()) {
    throw new Error("Backblaze B2 is not configured in environment variables.");
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await b2Client.send(command);

  return { success: true, key };
}

/**
 * Check if an audio file exists in the Backblaze bucket
 */
export async function audioExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await b2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

export default b2Client;
