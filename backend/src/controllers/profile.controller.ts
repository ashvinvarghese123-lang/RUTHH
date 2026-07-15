import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";
import { uploadImageBuffer } from "../services/cloudinary.service";
import { areFriends } from "../services/friendship.service";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { profile: true },
  });
  if (!user) throw new ApiError(404, "Profile not found.");

  const isOwner = req.user?.userId === user.id;
  const viewerIsFriend = !isOwner && req.user ? await areFriends(user.id, req.user.userId) : false;

  const visibleVisibilities = isOwner
    ? undefined // owner sees everything
    : viewerIsFriend
    ? { in: ["PUBLIC", "FRIENDS"] as ("PUBLIC" | "FRIENDS")[] }
    : ("PUBLIC" as const);

  const [journalCount, photoCount, sharedCount, friendCount] = await Promise.all([
    prisma.journalEntry.count({
      where: { userId: user.id, ...(visibleVisibilities ? { visibility: visibleVisibilities } : {}) },
    }),
    prisma.photo.count({ where: { journalEntry: { userId: user.id } } }),
    prisma.sharedEntry.count({ where: { ownerId: user.id, revoked: false } }),
    prisma.friendship.count({
      where: { status: "ACCEPTED", OR: [{ requesterId: user.id }, { addresseeId: user.id }] },
    }),
  ]);

  return ok(res, {
    username: user.username,
    email: isOwner ? user.email : undefined,
    profile: user.profile,
    stats: { journalCount, photoCount, sharedCount, friendCount },
    isOwner,
  });
});

/**
 * Updates display name, bio, and/or username. Username changes are
 * validated for uniqueness (case-insensitive collision is prevented by
 * the DB's unique constraint on the exact string; callers should
 * lowercase/normalize on the frontend if that matters to them).
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { displayName, bio, username } = req.body;
  const userId = req.user!.userId;

  if (username !== undefined) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== userId) {
      throw new ApiError(409, "That username is already taken.");
    }
    await prisma.user.update({ where: { id: userId }, data: { username } });
  }

  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      ...(displayName !== undefined ? { displayName } : {}),
      ...(bio !== undefined ? { bio } : {}),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return ok(res, { profile, username: user?.username });
});

export const uploadProfilePhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, "No image file was provided.");

  const result = await uploadImageBuffer(req.file.buffer, "ruth/profile");

  const profile = await prisma.profile.update({
    where: { userId: req.user!.userId },
    data: { profilePhoto: result.url },
  });

  return ok(res, { profile });
});

async function resolveVisibilityFilter(profileOwnerId: string, viewerId: string | undefined) {
  if (viewerId === profileOwnerId) return undefined; // owner sees everything
  const viewerIsFriend = viewerId ? await areFriends(profileOwnerId, viewerId) : false;
  return viewerIsFriend
    ? { in: ["PUBLIC", "FRIENDS"] as ("PUBLIC" | "FRIENDS")[] }
    : ("PUBLIC" as const);
}

/** Journals belonging to :username, visible to the current viewer — powers the Profile > Journals tab. */
export const getProfileJournals = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const meId = req.user?.userId;

  const owner = await prisma.user.findUnique({ where: { username } });
  if (!owner) throw new ApiError(404, "Profile not found.");

  const visibility = await resolveVisibilityFilter(owner.id, meId);
  const where = { userId: owner.id, ...(visibility ? { visibility } : {}) };

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { entryDate: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        photos: { orderBy: { position: "asc" }, take: 4 },
        likes: meId ? { where: { userId: meId }, select: { id: true } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  const shaped = entries.map((e: any) => {
    const { likes, _count, ...rest } = e;
    return { ...rest, likeCount: _count.likes, commentCount: _count.comments, likedByMe: (likes ?? []).length > 0 };
  });

  return ok(res, { entries: shaped, total, page, limit, totalPages: Math.ceil(total / limit) });
});

/** Every photo across :username's visible journals — powers the Profile > Gallery tab. */
export const getProfilePhotos = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const { year, month } = req.query as { year?: string; month?: string };
  const meId = req.user?.userId;

  const owner = await prisma.user.findUnique({ where: { username } });
  if (!owner) throw new ApiError(404, "Profile not found.");

  const visibility = await resolveVisibilityFilter(owner.id, meId);

  let dateRange: { gte: Date; lte: Date } | undefined;
  if (year) {
    const y = Number(year);
    const m = month ? Number(month) - 1 : 0;
    const start = month ? new Date(y, m, 1) : new Date(y, 0, 1);
    const end = month ? new Date(y, m + 1, 0, 23, 59, 59) : new Date(y, 11, 31, 23, 59, 59);
    dateRange = { gte: start, lte: end };
  }

  const photos = await prisma.photo.findMany({
    where: {
      journalEntry: {
        userId: owner.id,
        ...(visibility ? { visibility } : {}),
        ...(dateRange ? { entryDate: dateRange } : {}),
      },
    },
    orderBy: { createdAt: "desc" },
    include: { journalEntry: { select: { id: true, title: true, entryDate: true } } },
    take: 300,
  });

  return ok(res, { photos });
});
