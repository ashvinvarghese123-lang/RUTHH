import { Router } from "express";
import * as journalController from "../controllers/journal.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createJournalSchema, updateJournalSchema, listJournalsSchema } from "../validators/journal.validator";

const router = Router();
router.use(requireAuth);

router.get("/home-summary", journalController.getHomeSummary);
router.get("/memories", journalController.getMemories);
router.get("/", validate(listJournalsSchema), journalController.listJournals);
router.post("/", validate(createJournalSchema), journalController.createJournal);
router.get("/:id", journalController.getJournal);
router.patch("/:id", validate(updateJournalSchema), journalController.updateJournal);
router.delete("/:id", journalController.deleteJournal);

export default router;
