import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";
import { assertOwnership } from "./journal.controller";
import { generateToken } from "../services/token.service";
import { emailService } from "../services/email.service";

export const createShare = asyncHandler(async (req: Request, res: Response) => {
  const { journalEntryId, username, email, generateLink, permission } = req.body;
  const entry = await assertOwnership(journalEntryId, req.user!.userId);

  let recipientId: string | undefined;
  let recipientEmail: string | undefined = email;
  let linkToken: string | undefined;

  if (username) {
    const recipient = await prisma.user.findUnique({ where: { username } });
    if (!recipient) throw new ApiError(404, "No Ruth user found with that username.");
    recipientId = recipient.id;
  } else if (email) {
    const recipient = await prisma.user.findUnique({ where: { email } });
    recipientId = recipient?.id;
  } else if (generateLink) {
    linkToken = generateToken(24);
  }

  const share = await prisma.sharedEntry.create({
    data: {
      journalEntryId,
      ownerId: req.user!.userId,
      recipientId,
      recipientEmail,
      linkToken,
      permission,
    },
  });

  if (recipientId) {
    const owner = await prisma.profile.findUnique({ where: { userId: req.user!.userId } });
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "SHARED_JOURNAL",
        title: "A new journal page was shared with you",
        body: `${owner?.displayName ?? "Someone"} shared "${entry.title}" with you.`,
        metadata: { journalEntryId, shareId: share.id },
      },
    });
  } else if (recipientEmail) {
    const owner = await prisma.profile.findUnique({ where: { userId: req.user!.userId } });
    await emailService.sendShareNotification(recipientEmail, owner?.displayName ?? "A Ruth user", entry.title);
  }

  const shareLink = linkToken ? `${process.env.CLIENT_URL}/shared/${linkToken}` : undefined;
  return ok(res, { share, shareLink }, 201);
});

export const listSharesForEntry = asyncHandler(async (req: Request, res: Response) => {
  const { journalEntryId } = req.params;
  await assertOwnership(journalEntryId, req.user!.userId);

  const shares = await prisma.sharedEntry.findMany({
    where: { journalEntryId, revoked: false },
    include: { recipient: { select: { username: true, profile: true } } },
  });

  return ok(res, { shares });
});

export const revokeShare = asyncHandler(async (req: Request, res: Response) => {
  const { shareId } = req.params;

  const share = await prisma.sharedEntry.findUnique({ where: { id: shareId } });
  if (!share) throw new ApiError(404, "Share not found.");
  if (share.ownerId !== req.user!.userId) throw new ApiError(403, "You don't own this share.");

  await prisma.sharedEntry.update({ where: { id: shareId }, data: { revoked: true } });

  if (share.recipientId) {
    await prisma.notification.create({
      data: {
        userId: share.recipientId,
        type: "ACCESS_REVOKED",
        title: "Access revoked",
        body: "A journal page that was shared with you is no longer available.",
      },
    });
  }

  return ok(res, { revoked: true });
});

/** What's been shared WITH the current user. */
export const listSharedWithMe = asyncHandler(async (req: Request, res: Response) => {
  const shares = await prisma.sharedEntry.findMany({
    where: { recipientId: req.user!.userId, revoked: false },
    include: {
      journalEntry: { include: { photos: { take: 1 } } },
      owner: { select: { username: true, profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(res, { shares });
});

/** Public (token-based) view of a shared entry — no login required. */
export const getSharedByToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const share = await prisma.sharedEntry.findUnique({
    where: { linkToken: token },
    include: {
      journalEntry: { include: { photos: { orderBy: { position: "asc" } } } },
      owner: { select: { username: true, profile: true } },
    },
  });

  if (!share || share.revoked) throw new ApiError(404, "This shared link is invalid or has been revoked.");

  return ok(res, {
    entry: share.journalEntry,
    owner: share.owner,
    permission: share.permission,
  });
});
