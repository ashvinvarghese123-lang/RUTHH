import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { transformEntry, AIMode } from "../services/ai.service";
import { assertOwnership } from "./journal.controller";

/**
 * Transforms rough notes into a polished entry. If `journalEntryId` is
 * provided, persists the result onto that entry; otherwise returns a
 * preview only (used for live-preview while writing).
 */
export const rewriteEntry = asyncHandler(async (req: Request, res: Response) => {
  const { rawContent, mode, mood, location, weather, photoCount, journalEntryId } = req.body as {
    rawContent: string;
    mode: AIMode;
    mood?: string;
    location?: string;
    weather?: string;
    photoCount?: number;
    journalEntryId?: string;
  };

  const result = await transformEntry({ rawContent, mode, mood, location, weather, photoCount });

  if (journalEntryId) {
    await assertOwnership(journalEntryId, req.user!.userId);
    const entry = await prisma.journalEntry.update({
      where: { id: journalEntryId },
      data: {
        content: result.content,
        aiMode: mode,
        suggestedTitle: result.suggestedTitle,
        suggestedQuote: result.suggestedQuote,
        reflection: result.reflection,
        gratitude: result.gratitude,
      },
      include: { photos: true },
    });
    return ok(res, { entry, aiResult: result });
  }

  return ok(res, { aiResult: result });
});
