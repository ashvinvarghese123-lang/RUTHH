import { Router } from "express";
import * as shareController from "../controllers/share.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createShareSchema, revokeShareSchema } from "../validators/share.validator";

const router = Router();

router.get("/shared-with-me", requireAuth, shareController.listSharedWithMe);
router.get("/public/:token", shareController.getSharedByToken); // no auth — private link access
router.post("/", requireAuth, validate(createShareSchema), shareController.createShare);
router.get("/entry/:journalEntryId", requireAuth, shareController.listSharesForEntry);
router.delete("/:shareId", requireAuth, validate(revokeShareSchema), shareController.revokeShare);

export default router;
