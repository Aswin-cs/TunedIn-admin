import crypto from "crypto";
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
 * Supports both S3-compatible API and Backblaze B2 Native API for high reliability.
 */

const region =
  process.env.BACKBLAZE_REGION ||
  process.env.B2_REGION ||
  "eu-central-003";

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
  "tunedIn";

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
  forcePathStyle: false,
});

/**
 * Check if Backblaze B2 credentials are provided
 */
export function isBackblazeConfigured(): boolean {
  return Boolean(keyId && applicationKey && bucketName);
}

// Cached authorization session for B2 Native API
interface B2AuthSession {
  apiUrl: string;
  authorizationToken: string;
  downloadUrl: string;
  accountId: string;
  expiresAt: number;
}
let cachedAuth: B2AuthSession | null = null;

/**
 * Authorize with Backblaze B2 Native API (compatible with Master and Application keys)
 */
async function getB2Auth(): Promise<B2AuthSession> {
  const now = Date.now();
  if (cachedAuth && cachedAuth.expiresAt > now + 60000) {
    return cachedAuth;
  }

  const basicToken = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
  const res = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
    headers: { Authorization: `Basic ${basicToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to authorize with Backblaze B2: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  cachedAuth = {
    apiUrl: data.apiInfo?.storageApi?.apiUrl || "https://api.backblazeb2.com",
    authorizationToken: data.authorizationToken,
    downloadUrl: data.apiInfo?.storageApi?.downloadUrl || `https://f${region.split("-")[1]}.backblazeb2.com`,
    accountId: data.accountId,
    expiresAt: now + 23 * 3600 * 1000, // Valid for ~24 hours
  };
  return cachedAuth;
}

/**
 * Find bucket metadata by bucketName
 */
async function getB2BucketInfo(targetBucket: string) {
  const auth = await getB2Auth();
  const res = await fetch(`${auth.apiUrl}/b2api/v3/b2_list_buckets?accountId=${auth.accountId}`, {
    headers: { Authorization: auth.authorizationToken },
  });

  if (!res.ok) {
    throw new Error(`Failed to list Backblaze B2 buckets: ${res.status}`);
  }

  const data = await res.json();
  const bucket =
    data.buckets?.find((b: { bucketName: string }) => b.bucketName.toLowerCase() === targetBucket.toLowerCase()) ||
    data.buckets?.[0];

  if (!bucket) {
    throw new Error(`Bucket "${targetBucket}" not found in Backblaze account.`);
  }

  return { bucket, auth };
}

export interface BackblazeUsageStats {
  configured: boolean;
  bucketName: string;
  bucketId: string;
  region: string;
  fileCount: number;
  totalBytes: number;
  formattedSize: string;
  freeTierLimitBytes: number;
  freeTierFormatted: string;
  percentUsed: number;
  status: "live" | "not_configured" | "error";
  error?: string;
}

/**
 * Format bytes to readable string (e.g. 14.2 MB, 1.2 GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0.00 MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // If bytes < 1MB, display in MB for uniform audio dashboard display
  if (i < 2) {
    return `${(bytes / (k * k)).toFixed(dm)} MB`;
  }
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Fetch exact live storage details and file count from Backblaze B2
 */
export async function getBackblazeStorageUsage(): Promise<BackblazeUsageStats> {
  if (!isBackblazeConfigured()) {
    return {
      configured: false,
      bucketName: bucketName || "Not configured",
      bucketId: "",
      region,
      fileCount: 0,
      totalBytes: 0,
      formattedSize: "0.00 MB",
      freeTierLimitBytes: 10 * 1024 * 1024 * 1024,
      freeTierFormatted: "10 GB",
      percentUsed: 0,
      status: "not_configured",
    };
  }

  try {
    const { bucket, auth } = await getB2BucketInfo(bucketName);
    let nextFileName: string | null = null;
    let totalBytes = 0;
    let fileCount = 0;

    do {
      let url = `${auth.apiUrl}/b2api/v3/b2_list_file_names?bucketId=${bucket.bucketId}&maxFileCount=1000`;
      if (nextFileName) {
        url += `&startFileName=${encodeURIComponent(nextFileName)}`;
      }
      const filesRes = await fetch(url, {
        headers: { Authorization: auth.authorizationToken },
      });

      if (!filesRes.ok) break;

      const fData = await filesRes.json();
      if (fData.files && Array.isArray(fData.files)) {
        fileCount += fData.files.length;
        for (const file of fData.files) {
          totalBytes += file.contentLength || 0;
        }
      }
      nextFileName = fData.nextFileName || null;
    } while (nextFileName);

    const freeTierLimitBytes = 10 * 1024 * 1024 * 1024; // 10 GB Free Tier
    const percentUsed = Math.min(100, Math.max(0.1, (totalBytes / freeTierLimitBytes) * 100));

    return {
      configured: true,
      bucketName: bucket.bucketName,
      bucketId: bucket.bucketId,
      region,
      fileCount,
      totalBytes,
      formattedSize: formatBytes(totalBytes),
      freeTierLimitBytes,
      freeTierFormatted: "10 GB",
      percentUsed: parseFloat(percentUsed.toFixed(2)),
      status: "live",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      configured: true,
      bucketName,
      bucketId: "",
      region,
      fileCount: 0,
      totalBytes: 0,
      formattedSize: "0.00 MB",
      freeTierLimitBytes: 10 * 1024 * 1024 * 1024,
      freeTierFormatted: "10 GB",
      percentUsed: 0,
      status: "error",
      error: msg,
    };
  }
}

export interface AudioUploadParams {
  fileBuffer: Buffer | Uint8Array;
  fileName: string;
  mimeType?: string;
  folder?: string;
  metadata?: Record<string, string>;
}

export interface AudioUploadResult {
  audioUrl: string;
  key: string;
  size: number;
  bucket: string;
  contentType: string;
}

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

export function getBackblazePublicUrl(key: string): string {
  if (customDomain) {
    const cleanDomain = customDomain.replace(/\/+$/, "");
    return `${cleanDomain}/${key}`;
  }
  return `https://${bucketName}.s3.${region}.backblazeb2.com/${key}`;
}

/**
 * Upload an audio file to Backblaze B2.
 * Uses native upload API for 100% key compatibility with Master & App keys.
 */
export async function uploadAudio({
  fileBuffer,
  fileName,
  mimeType,
  folder = "tunedin/audio",
}: AudioUploadParams): Promise<AudioUploadResult> {
  if (!isBackblazeConfigured()) {
    throw new Error("Backblaze B2 is not configured in environment variables.");
  }

  const contentType = mimeType || detectAudioMimeType(fileName);
  const sanitizedName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_");
  const uniqueKey = `${folder}/${Date.now()}-${sanitizedName}`;

  try {
    // 1. Try B2 Native API upload first (works seamlessly with all keys)
    const { bucket, auth } = await getB2BucketInfo(bucketName);
    const upUrlRes = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url?bucketId=${bucket.bucketId}`, {
      headers: { Authorization: auth.authorizationToken },
    });

    if (!upUrlRes.ok) {
      throw new Error(`Failed to get B2 upload URL: ${upUrlRes.status}`);
    }

    const upUrlData = await upUrlRes.json();
    const buf = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    const sha1 = crypto.createHash("sha1").update(buf).digest("hex");

    const uploadRes = await fetch(upUrlData.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: upUrlData.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(uniqueKey),
        "Content-Type": contentType,
        "Content-Length": buf.length.toString(),
        "X-Bz-Content-Sha1": sha1,
      },
      body: new Uint8Array(buf),
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`B2 native upload failed: ${uploadRes.status} ${errText}`);
    }

    const audioUrl = getBackblazePublicUrl(uniqueKey);
    return {
      audioUrl,
      key: uniqueKey,
      size: buf.length,
      bucket: bucket.bucketName,
      contentType,
    };
  } catch (nativeErr) {
    // Fallback to S3 Client if available
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: contentType,
      ContentDisposition: "inline",
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
}

/**
 * Delete an audio file from Backblaze B2
 */
export async function deleteAudio(key: string): Promise<{ success: boolean; key: string }> {
  if (!isBackblazeConfigured()) {
    throw new Error("Backblaze B2 is not configured in environment variables.");
  }

  try {
    const { bucket, auth } = await getB2BucketInfo(bucketName);
    // Find fileId
    const filesRes = await fetch(
      `${auth.apiUrl}/b2api/v3/b2_list_file_names?bucketId=${bucket.bucketId}&prefix=${encodeURIComponent(key)}&maxFileCount=1`,
      { headers: { Authorization: auth.authorizationToken } }
    );
    const fData = await filesRes.json();
    const file = fData.files?.[0];
    if (file && file.fileName === key) {
      await fetch(
        `${auth.apiUrl}/b2api/v3/b2_delete_file_version?fileId=${file.fileId}&fileName=${encodeURIComponent(key)}`,
        { headers: { Authorization: auth.authorizationToken } }
      );
      return { success: true, key };
    }
  } catch {
    // Fallback to S3 command
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  await b2Client.send(command);
  return { success: true, key };
}

export default b2Client;
