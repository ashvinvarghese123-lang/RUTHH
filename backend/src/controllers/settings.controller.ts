import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await prisma.settings.findUnique({ where: { userId: req.user!.userId } });
  return ok(res, { settings });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const { language, writingReminder, reminderHour, memoryReminders, emailNotifications } = req.body;

  const settings = await prisma.settings.update({
    where: { userId: req.user!.userId },
    data: {
      ...(language !== undefined ? { language } : {}),
      ...(writingReminder !== undefined ? { writingReminder } : {}),
      ...(reminderHour !== undefined ? { reminderHour } : {}),
      ...(memoryReminders !== undefined ? { memoryReminders } : {}),
      ...(emailNotifications !== undefined ? { emailNotifications } : {}),
    },
  });

  return ok(res, { settings });
});

export const exportData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const [user, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true, settings: true } }),
    prisma.journalEntry.findMany({ where: { userId }, include: { photos: true } }),
  ]);

  res.setHeader("Content-Disposition", "attachment; filename=ruth-export.json");
  return ok(res, { user: { email: user?.email, username: user?.username, profile: user?.profile }, entries });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: req.user!.userId } });
  res.clearCookie("ruth_refresh_token");
  return ok(res, { deleted: true });
});
