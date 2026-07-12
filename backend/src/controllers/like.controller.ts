import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";
import { canViewByVisibility } from "../services/friendship.service";

async function assertViewable(entryId: string, viewerId: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new ApiError(404, "Journal entry not found.");
  const allowed = await canViewByVisibility(entry.userId, entry.visibility, viewerId);
  if (!allowed) throw new ApiError(403, "You don't have access to this entry.");
  return entry;
}

export const likeEntry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const meId = req.user!.userId;
  const entry = await assertViewable(id, meId);

  const existing = await prisma.like.findUnique({
    where: { userId_journalEntryId: { userId: meId, journalEntryId: id } },
  });
  if (existing) return ok(res, { liked: true }); // idempotent

  await prisma.like.create({ data: { userId: meId, journalEntryId: id } });

  if (entry.userId !== meId) {
    const me = await prisma.profile.findUnique({ where: { userId: meId } });
    await prisma.notification.create({
      data: {
        userId: entry.userId,
        type: "NEW_LIKE",
        title: "Someone liked your entry",
        body: `${me?.displayName ?? "Someone"} liked "${entry.title}".`,
        metadata: { journalEntryId: id },
      },
    });
  }

  const count = await prisma.like.count({ where: { journalEntryId: id } });
  return ok(res, { liked: true, likeCount: count }, 201);
});

export const unlikeEntry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const meId = req.user!.userId;

  await prisma.like.deleteMany({ where: { userId: meId, journalEntryId: id } });
  const count = await prisma.like.count({ where: { journalEntryId: id } });
  return ok(res, { liked: false, likeCount: count });
});
