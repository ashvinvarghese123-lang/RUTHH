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
    ? { in: ["PUBLIC", "FRIENDS"] as const }
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
    profile: user.profile,
    stats: { journalCount, photoCount, sharedCount, friendCount },
    isOwner,
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { displayName, bio } = req.body;

  const profile = await prisma.profile.update({
    where: { userId: req.user!.userId },
    data: {
      ...(displayName !== undefined ? { displayName } : {}),
      ...(bio !== undefined ? { bio } : {}),
    },
  });

  return ok(res, { profile });
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
