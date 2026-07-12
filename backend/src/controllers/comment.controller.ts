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

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await assertViewable(id, req.user!.userId);

  const comments = await prisma.comment.findMany({
    where: { journalEntryId: id },
    include: { user: { select: { username: true, profile: { select: { displayName: true, profilePhoto: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return ok(res, { comments });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { body } = req.body;
  const meId = req.user!.userId;
  const entry = await assertViewable(id, meId);

  const comment = await prisma.comment.create({
    data: { journalEntryId: id, userId: meId, body },
    include: { user: { select: { username: true, profile: { select: { displayName: true, profilePhoto: true } } } } },
  });

  if (entry.userId !== meId) {
    const me = await prisma.profile.findUnique({ where: { userId: meId } });
    await prisma.notification.create({
      data: {
        userId: entry.userId,
        type: "NEW_COMMENT",
        title: "New comment on your entry",
        body: `${me?.displayName ?? "Someone"} commented on "${entry.title}".`,
        metadata: { journalEntryId: id, commentId: comment.id },
      },
    });
  }

  return ok(res, { comment }, 201);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const meId = req.user!.userId;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { journalEntry: { select: { userId: true } } },
  });
  if (!comment) throw new ApiError(404, "Comment not found.");

  const isAuthor = comment.userId === meId;
  const isEntryOwner = comment.journalEntry.userId === meId;
  if (!isAuthor && !isEntryOwner) throw new ApiError(403, "You can't delete this comment.");

  await prisma.comment.delete({ where: { id: commentId } });
  return ok(res, { deleted: true });
});
