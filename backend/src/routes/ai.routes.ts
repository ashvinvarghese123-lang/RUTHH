import { Router } from "express";
import * as aiController from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { rewriteEntrySchema } from "../validators/ai.validator";

const router = Router();
router.use(requireAuth);

router.post("/rewrite", validate(rewriteEntrySchema), aiController.rewriteEntry);

export default router;
