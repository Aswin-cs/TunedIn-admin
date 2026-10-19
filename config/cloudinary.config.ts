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

/**
 * Helper to generate an optimized delivery URL for a poster
 */
export function getOptimizedPosterUrl(
  publicId: string,
  transformations?: { width?: number; height?: number; quality?: string | number }
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: transformations?.width || 600,
        height: transformations?.height || 600,
        crop: "fill",
        fetch_format: "auto",
        quality: transformations?.quality || "auto",
      },
    ],
  });
}

export default cloudinary;
