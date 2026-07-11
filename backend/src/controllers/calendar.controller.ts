import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

/** Returns entries for a given month, keyed by day, for the calendar view. */
export const getCalendarMonth = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1; // 1-12

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const entries = await prisma.journalEntry.findMany({
    where: { userId: req.user!.userId, entryDate: { gte: start, lte: end } },
    select: { id: true, title: true, mood: true, entryDate: true, isFavorite: true },
    orderBy: { entryDate: "asc" },
  });

  const byDay: Record<string, typeof entries> = {};
  for (const entry of entries) {
    const key = entry.entryDate.toISOString().slice(0, 10);
    (byDay[key] ??= []).push(entry);
  }

  return ok(res, { year, month, entriesByDay: byDay });
});
