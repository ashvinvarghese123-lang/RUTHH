import { Router } from "express";
import * as feedController from "../controllers/feed.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { feedQuerySchema } from "../validators/comment.validator";

const router = Router();
router.use(requireAuth);

router.get("/", validate(feedQuerySchema), feedController.getFeed);

export default router;
