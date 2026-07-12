import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { commentIdParamSchema } from "../validators/comment.validator";

// Mounted at /comments — only the standalone delete-by-id lives here.
// list/create are nested under /journals/:id/comments (see journal.routes.ts).
const router = Router();
router.use(requireAuth);

router.delete("/:commentId", validate(commentIdParamSchema), commentController.deleteComment);

export default router;
