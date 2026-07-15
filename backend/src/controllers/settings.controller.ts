import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";
import { comparePassword } from "../utils/password";
import { logger } from "../utils/logger";

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await prisma.settings.findUnique({ where: { userId: req.user!.userId } });
  return ok(res, { settings });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const { language, writingReminder, reminderHour, memoryReminders, emailNotifications, defaultVisibility } =
    req.body;

  const settings = await prisma.settings.update({
    where: { userId: req.user!.userId },
    data: {
      ...(language !== undefined ? { language } : {}),
      ...(writingReminder !== undefined ? { writingReminder } : {}),
      ...(reminderHour !== undefined ? { reminderHour } : {}),
      ...(memoryReminders !== undefined ? { memoryReminders } : {}),
      ...(emailNotifications !== undefined ? { emailNotifications } : {}),
      ...(defaultVisibility !== undefined ? { defaultVisibility } : {}),
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

/**
 * Permanently deletes the account. Requires the current password as
 * confirmation (Instagram-style flow) and accepts an optional free-text
 * reason, which is only logged server-side for product feedback — never
 * stored against the (now-deleted) user record.
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const { password, reason } = req.body;
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new ApiError(401, "Your password is incorrect.");
  }

  if (reason) {
    logger.info(`Account deletion reason (user ${userId}): ${reason}`);
  }

  await prisma.user.delete({ where: { id: userId } });
  res.clearCookie("ruth_refresh_token");
  return ok(res, { deleted: true });
});
