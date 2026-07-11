import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { requireAuth, attachUserIfPresent } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";

const router = Router();

router.get("/:username", attachUserIfPresent, profileController.getProfile);
router.patch("/", requireAuth, profileController.updateProfile);
router.post("/photo", requireAuth, uploadImages.single("photo"), profileController.uploadProfilePhoto);

export default router;
