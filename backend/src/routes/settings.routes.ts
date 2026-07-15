import { Router } from "express";
import * as settingsController from "../controllers/settings.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { deleteAccountSchema } from "../validators/profile.validator";

const router = Router();
router.use(requireAuth);

router.get("/", settingsController.getSettings);
router.patch("/", settingsController.updateSettings);
router.get("/export", settingsController.exportData);
router.delete("/account", validate(deleteAccountSchema), settingsController.deleteAccount);

export default router;
