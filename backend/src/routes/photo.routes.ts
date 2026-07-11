import { Router } from "express";
import * as photoController from "../controllers/photo.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";

const router = Router();
router.use(requireAuth);

router.post("/", uploadImages.array("photos", 10), photoController.uploadPhotos);
router.post("/reorder", photoController.reorderPhotos);
router.delete("/:id", photoController.deletePhoto);

export default router;
