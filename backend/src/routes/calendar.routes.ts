import { Router } from "express";
import * as calendarController from "../controllers/calendar.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.use(requireAuth);

router.get("/", calendarController.getCalendarMonth);

export default router;
