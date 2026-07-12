import { Router } from "express";
import * as journalController from "../controllers/journal.controller";
import * as likeController from "../controllers/like.controller";
import * as commentController from "../controllers/comment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createJournalSchema, updateJournalSchema, listJournalsSchema } from "../validators/journal.validator";
import { createCommentSchema, journalIdParamSchema } from "../validators/comment.validator";

const router = Router();
router.use(requireAuth);

router.get("/home-summary", journalController.getHomeSummary);
router.get("/memories", journalController.getMemories);
router.get("/", validate(listJournalsSchema), journalController.listJournals);
router.post("/", validate(createJournalSchema), journalController.createJournal);
router.get("/:id", journalController.getJournal);
router.patch("/:id", validate(updateJournalSchema), journalController.updateJournal);
router.delete("/:id", journalController.deleteJournal);

router.post("/:id/like", validate(journalIdParamSchema), likeController.likeEntry);
router.delete("/:id/like", validate(journalIdParamSchema), likeController.unlikeEntry);

router.get("/:id/comments", validate(journalIdParamSchema), commentController.listComments);
router.post("/:id/comments", validate(createCommentSchema), commentController.createComment);

export default router;
