import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

/**
 * Cloudinary Configuration for TunedIn Admin
 * Dedicated for poster and album artwork image uploading & transformation.
 */

// Validate and configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

/**
 * Check if Cloudinary credentials are provided in environment
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export interface PosterUploadOptions {
  /** Target folder in Cloudinary (defaults to 'tunedin/posters') */
  folder?: string;
  /** Custom public ID (auto-generated if omitted) */
  publicId?: string;
  /** Target width for resizing (e.g. 500 for standard 500x500 poster) */
  width?: number;
  /** Target height for resizing (e.g. 500 for standard 500x500 poster) */
  height?: number;
  /** Crop mode: 'fill', 'scale', 'thumb', etc. (default: 'fill') */
  crop?: string;
  /** Custom tags for filtering/organizing */
  tags?: string[];
}

export interface PosterUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

/**
 * Upload a song poster or album art image to Cloudinary.
 * Accepts a file path, base64 data URI, remote URL, or a Buffer.
 *
 * @param file - File path, base64 data URI string, remote URL, or Buffer
 * @param options - Upload configuration options
 * @returns Promise<PosterUploadResult>
 */
export async function uploadPoster(
  file: string | Buffer,
  options: PosterUploadOptions = {}
): Promise<PosterUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
    );
  }

  const folder = options.folder || process.env.CLOUDINARY_POSTER_FOLDER || "tunedin/posters";

  // Upload configuration tailored for song posters (square format, optimized delivery)
  const uploadParams: Record<string, unknown> = {
    folder,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [
      {
        width: options.width || 600,
        height: options.height || 600,
        crop: options.crop || "fill",
        gravity: "auto",
        fetch_format: "auto",
        quality: "auto",
      },
    ],
    tags: options.tags || ["poster", "song", "tunedin"],
  };

  if (options.publicId) {
    uploadParams.public_id = options.publicId;
  }

  // Handle Buffer uploads via upload_stream
  if (Buffer.isBuffer(file)) {
    return new Promise<PosterUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadParams,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed: No result returned"));
          } else {
            resolve({
              url: result.url,
              secure_url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              created_at: result.created_at,
            });
          }
        }
      );
      uploadStream.end(file);
    });
  }

  // Handle string uploads (data URI, remote URL, or local file path)
  const result = await cloudinary.uploader.upload(file, uploadParams);

  return {
    url: result.url,
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    created_at: result.created_at,
  };
}

/**
 * Delete a poster image from Cloudinary by its public ID.
 *
 * @param publicId - The Cloudinary public ID of the poster
 */
export async function deletePoster(publicId: string): Promise<{ result: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured in environment variables.");
  }

  const response = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  return response;
}

export interface AudioUploadOptions {
  /** Target folder in Cloudinary (defaults to 'tunedin/songs') */
  folder?: string;
  /** Custom public ID (auto-generated if omitted) */
  publicId?: string;
  /** Custom tags for filtering/organizing */
  tags?: string[];
  /** Original file name */
  filename?: string;
}

export interface AudioUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  duration?: number;
  bytes: number;
  created_at: string;
}

/**
 * Upload a song or master audio file to Cloudinary.
 * Accepts a file path, base64 data URI, remote URL, or a Buffer.
 * Files are stored in the 'tunedin/songs' folder as resource_type 'video'.
 *
 * @param file - File path, base64 data URI, remote URL, or Buffer
 * @param options - Upload configuration options
 * @returns Promise<AudioUploadResult>
 */
export async function uploadAudio(
  file: string | Buffer,
  options: AudioUploadOptions = {}
): Promise<AudioUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
    );
  }

  const folder = options.folder || process.env.CLOUDINARY_SONGS_FOLDER || "tunedin/songs";

  const uploadParams: Record<string, unknown> = {
    folder,
    resource_type: "video", // In Cloudinary, audio files (FLAC, MP3, WAV, etc.) use resource_type "video"
    tags: options.tags || ["song", "audio", "tunedin"],
  };

  if (options.publicId) {
    uploadParams.public_id = options.publicId;
  }

  if (Buffer.isBuffer(file)) {
    return new Promise<AudioUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadParams,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary audio upload failed: No result returned"));
          } else {
            resolve({
              url: result.url,
              secure_url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              duration: result.duration,
              bytes: result.bytes,
              created_at: result.created_at,
            });
          }
        }
      );
      uploadStream.end(file);
    });
  }

  const result = await cloudinary.uploader.upload(file, uploadParams);

  return {
    url: result.url,
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    duration: result.duration,
    bytes: result.bytes,
    created_at: result.created_at,
  };
}

/**
 * Delete a song audio file from Cloudinary by its public ID.
 *
 * @param publicId - The Cloudinary public ID of the audio file
 */
export async function deleteAudio(publicId: string): Promise<{ result: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured in environment variables.");
  }

  const response = await cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
  });

  return response;
}

export interface CloudinaryUsageStats {
  configured: boolean;
  plan: string;
  storageBytes: number;
  storageFormatted: string;
  bandwidthBytes: number;
  bandwidthFormatted: string;
  objectsCount: number;
  transformations: number;
  creditsUsed: number;
  creditsLimit: number;
  creditsUsedPercent: number;
  status: "live" | "not_configured" | "error";
  error?: string;
}

export function formatCloudinaryBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return "0.00 MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 2) {
    return `${(bytes / (k * k)).toFixed(dm)} MB`;
  }
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Fetch exact live storage and bandwidth details from Cloudinary Admin API
 */
export async function getCloudinaryStorageUsage(): Promise<CloudinaryUsageStats> {
  if (!isCloudinaryConfigured()) {
    return {
      configured: false,
      plan: "Free",
      storageBytes: 0,
      storageFormatted: "0.00 MB",
      bandwidthBytes: 0,
      bandwidthFormatted: "0.00 MB",
      objectsCount: 0,
      transformations: 0,
      creditsUsed: 0,
      creditsLimit: 25,
      creditsUsedPercent: 0,
      status: "not_configured",
    };
  }

  try {
    const usage = await cloudinary.api.usage();
    const storageBytes = usage.storage?.usage || 0;
    const bandwidthBytes = usage.bandwidth?.usage || 0;
    const objectsCount = usage.objects?.usage || usage.resources || 0;
    const transformations = usage.transformations?.usage || 0;
    const creditsUsed = usage.credits?.usage || 0;
    const creditsLimit = usage.credits?.limit || 25;
    const creditsUsedPercent = usage.credits?.used_percent || 0;

    return {
      configured: true,
      plan: usage.plan || "Free",
      storageBytes,
      storageFormatted: formatCloudinaryBytes(storageBytes),
      bandwidthBytes,
      bandwidthFormatted: formatCloudinaryBytes(bandwidthBytes),
      objectsCount,
      transformations,
      creditsUsed: parseFloat(creditsUsed.toFixed(2)),
      creditsLimit,
      creditsUsedPercent: parseFloat(creditsUsedPercent.toFixed(1)),
      status: "live",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      configured: true,
      plan: "Free",
      storageBytes: 0,
      storageFormatted: "0.00 MB",
      bandwidthBytes: 0,
      bandwidthFormatted: "0.00 MB",
      objectsCount: 0,
      transformations: 0,
      creditsUsed: 0,
      creditsLimit: 25,
      creditsUsedPercent: 0,
      status: "error",
      error: msg,
    };
  }
}

export default cloudinary;

