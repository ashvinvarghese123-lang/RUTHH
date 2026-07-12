import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { getFriendIds } from "../services/friendship.service";

/**
 * The public feed: your own entries (any visibility) + PUBLIC entries from
 * anyone + FRIENDS entries from your accepted friends. This is what powers
 * the new Home/Feed page.
 */
export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const meId = req.user!.userId;
  const { page, limit } = req.query as unknown as { page: number; limit: number };

  const friendIds = await getFriendIds(meId);

  const where = {
    OR: [
      { userId: meId },
      { visibility: "PUBLIC" as const },
      { visibility: "FRIENDS" as const, userId: { in: friendIds } },
    ],
  };

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      orderBy: { entryDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        photos: { orderBy: { position: "asc" }, take: 4 },
        user: { select: { username: true, profile: { select: { displayName: true, profilePhoto: true } } } },
        likes: { where: { userId: meId }, select: { id: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  const shaped = entries.map((e) => ({
    ...e,
    likeCount: e._count.likes,
    commentCount: e._count.comments,
    likedByMe: e.likes.length > 0,
    likes: undefined,
    _count: undefined,
  }));

  return ok(res, { entries: shaped, total, page, limit, totalPages: Math.ceil(total / limit) });
});
