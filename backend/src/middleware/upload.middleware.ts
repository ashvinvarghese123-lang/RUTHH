import multer from "multer";

// Images are buffered in memory then streamed straight to Cloudinary —
// nothing touches disk, which keeps the API stateless and easy to scale horizontally.
const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 10 }, // 15MB/file, 10 files per request
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});
