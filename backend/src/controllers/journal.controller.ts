import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";
import { canViewByVisibility } from "../services/friendship.service";

export const createJournal = asyncHandler(async (req: Request, res: Response) => {
  const { title, rawContent, content, mood, location, weather, tags, isFavorite, visibility, entryDate } = req.body;

  const entry = await prisma.journalEntry.create({
    data: {
      userId: req.user!.userId,
      title,
      rawContent,
      content: content ?? rawContent,
      mood,
      location,
      weather,
      tags: tags ?? [],
      isFavorite: isFavorite ?? false,
      visibility: visibility ?? "PUBLIC",
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    },
    include: { photos: true },
  });

  return ok(res, { entry }, 201);
});

export const updateJournal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await assertOwnership(id, req.user!.userId);

  const data = { ...req.body };
  if (data.entryDate) data.entryDate = new Date(data.entryDate);

  const entry = await prisma.journalEntry.update({
    where: { id },
    data,
    include: { photos: true },
  });

  return ok(res, { entry });
});

// Autosave uses the same handler as update but is mounted on a distinct,
// unrate-limited-for-typing route on the frontend (PATCH /journals/:id).
export const autosaveJournal = updateJournal;

export const deleteJournal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await assertOwnership(id, req.user!.userId);
  await prisma.journalEntry.delete({ where: { id } });
  return ok(res, { deleted: true });
});

export const getJournal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const meId = req.user!.userId;

  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { position: "asc" } },
      user: { select: { username: true, profile: { select: { displayName: true, profilePhoto: true } } } },
      likes: { where: { userId: meId }, select: { id: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!entry) throw new ApiError(404, "Journal entry not found.");

  const viaVisibility = await canViewByVisibility(entry.userId, entry.visibility, meId);
  let allowed = viaVisibility;

  if (!allowed) {
    const directShare = await prisma.sharedEntry.findFirst({
      where: { journalEntryId: id, recipientId: meId, revoked: false },
    });
    allowed = Boolean(directShare);
  }

  if (!allowed) throw new ApiError(403, "You don't have access to this entry.");

  const { likes, _count, ...rest } = entry;
  return ok(res, {
    entry: { ...rest, likeCount: _count.likes, commentCount: _count.comments, likedByMe: likes.length > 0 },
  });
});

export const listJournals = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, favoritesOnly, tag } = req.query as unknown as {
    page: number; limit: number; favoritesOnly?: boolean; tag?: string;
  };
  const meId = req.user!.userId;

  const where = {
    userId: meId,
    ...(favoritesOnly ? { isFavorite: true } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { entryDate: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        photos: { orderBy: { position: "asc" }, take: 4 },
        likes: { where: { userId: meId }, select: { id: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  const shaped = entries.map((e) => {
    const { likes, _count, ...rest } = e;
    return { ...rest, likeCount: _count.likes, commentCount: _count.comments, likedByMe: likes.length > 0 };
  });

  return ok(res, { entries: shaped, total, page, limit, totalPages: Math.ceil(total / limit) });
});

/** "One year ago today", "Two years ago today", etc. */
export const getMemories = asyncHandler(async (req: Request, res: Response) => {
  const today = new Date();
  const memories = [];

  for (let yearsAgo = 1; yearsAgo <= 10; yearsAgo++) {
    const start = new Date(today.getFullYear() - yearsAgo, today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear() - yearsAgo, today.getMonth(), today.getDate(), 23, 59, 59);

    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.user!.userId, entryDate: { gte: start, lte: end } },
      include: { photos: { take: 1 } },
    });

    if (entries.length) memories.push({ yearsAgo, entries });
  }

  return ok(res, { memories });
});

export const getHomeSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [todayEntry, recentEntries, counts] = await Promise.all([
    prisma.journalEntry.findFirst({ where: { userId, entryDate: { gte: startOfDay, lte: endOfDay } } }),
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { entryDate: "desc" },
      take: 5,
      include: { photos: { take: 1 } },
    }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);

  return ok(res, { todayEntry, recentEntries, totalEntries: counts });
});

// ------------------------------------------------------------
export async function assertOwnership(entryId: string, userId: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new ApiError(404, "Journal entry not found.");
  if (entry.userId !== userId) throw new ApiError(403, "You don't have permission to modify this entry.");
  return entry;
}
