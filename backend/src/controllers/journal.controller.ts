import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";

export const createJournal = asyncHandler(async (req: Request, res: Response) => {
  const { title, rawContent, content, mood, location, weather, tags, isFavorite, isPrivate, entryDate } = req.body;

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
      isPrivate: isPrivate ?? true,
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

  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: { photos: { orderBy: { position: "asc" } } },
  });
  if (!entry) throw new ApiError(404, "Journal entry not found.");
  if (entry.userId !== req.user!.userId) throw new ApiError(403, "You don't have access to this entry.");

  return ok(res, { entry });
});

export const listJournals = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, favoritesOnly, tag } = req.query as unknown as {
    page: number; limit: number; favoritesOnly?: boolean; tag?: string;
  };

  const where = {
    userId: req.user!.userId,
    ...(favoritesOnly ? { isFavorite: true } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      orderBy: { entryDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { photos: { orderBy: { position: "asc" }, take: 4 } },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return ok(res, { entries, total, page, limit, totalPages: Math.ceil(total / limit) });
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
