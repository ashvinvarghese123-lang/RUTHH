import { Router } from "express";
import * as searchController from "../controllers/search.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { searchJournalsSchema } from "../validators/journal.validator";

const router = Router();
router.use(requireAuth);

router.get("/", validate(searchJournalsSchema), searchController.searchJournals);

export default router;
