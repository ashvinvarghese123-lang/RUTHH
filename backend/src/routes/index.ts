import { Router } from "express";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import journalRoutes from "./journal.routes";
import photoRoutes from "./photo.routes";
import shareRoutes from "./share.routes";
import aiRoutes from "./ai.routes";
import notificationRoutes from "./notification.routes";
import settingsRoutes from "./settings.routes";
import searchRoutes from "./search.routes";
import calendarRoutes from "./calendar.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/journals", journalRoutes);
router.use("/photos", photoRoutes);
router.use("/shares", shareRoutes);
router.use("/ai", aiRoutes);
router.use("/notifications", notificationRoutes);
router.use("/settings", settingsRoutes);
router.use("/search", searchRoutes);
router.use("/calendar", calendarRoutes);

router.get("/health", (_req, res) => res.json({ success: true, message: "Ruth API is running." }));

export default router;
