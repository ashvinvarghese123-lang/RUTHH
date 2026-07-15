import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { requireAuth, attachUserIfPresent } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateProfileSchema, profileJournalsSchema, profilePhotosSchema } from "../validators/profile.validator";

const router = Router();

router.get("/:username", attachUserIfPresent, profileController.getProfile);
router.get(
  "/:username/journals",
  attachUserIfPresent,
  validate(profileJournalsSchema),
  profileController.getProfileJournals
);
router.get(
  "/:username/photos",
  attachUserIfPresent,
  validate(profilePhotosSchema),
  profileController.getProfilePhotos
);
router.patch("/", requireAuth, validate(updateProfileSchema), profileController.updateProfile);
router.post("/photo", requireAuth, uploadImages.single("photo"), profileController.uploadProfilePhoto);

export default router;
