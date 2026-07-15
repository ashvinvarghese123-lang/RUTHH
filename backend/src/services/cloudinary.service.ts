import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";
import { ApiError } from "../utils/apiResponse";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

const isConfigured = Boolean(
  env.cloudinary.cloudName &&
    env.cloudinary.apiKey &&
    env.cloudinary.apiSecret &&
    !env.cloudinary.cloudName.includes("your_cloud_name")
);

/**
 * Uploads an image buffer to Cloudinary with automatic compression
 * and a sensible max dimension so large phone photos don't bloat storage.
 */
export function uploadImageBuffer(buffer: Buffer, folder = "ruth/journal"): Promise<UploadResult> {
  if (!isConfigured) {
    throw new ApiError(
      503,
      "Photo storage isn't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your backend environment variables to enable photo uploads."
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 2000, height: 2000, crop: "limit" }, { quality: "auto:good" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new ApiError(502, "Cloudinary rejected that upload. Double-check your Cloudinary credentials are correct.")
          );
        }
        resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
      }
    );
    stream.end(buffer);
  });
}

export function deleteImage(publicId: string): Promise<void> {
  if (!isConfigured) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId).then(() => undefined);
}
