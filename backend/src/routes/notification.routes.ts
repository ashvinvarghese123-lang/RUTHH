import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.use(requireAuth);

router.get("/", notificationController.listNotifications);
router.patch("/:id/read", notificationController.markNotificationRead);
router.patch("/read-all", notificationController.markAllRead);

export default router;
