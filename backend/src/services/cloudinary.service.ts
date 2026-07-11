import { cloudinary } from "../config/cloudinary";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Uploads an image buffer to Cloudinary with automatic compression
 * and a sensible max dimension so large phone photos don't bloat storage.
 */
export function uploadImageBuffer(buffer: Buffer, folder = "ruth/journal"): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 2000, height: 2000, crop: "limit" }, { quality: "auto:good" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed."));
        resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
      }
    );
    stream.end(buffer);
  });
}

export function deleteImage(publicId: string): Promise<void> {
  return cloudinary.uploader.destroy(publicId).then(() => undefined);
}
