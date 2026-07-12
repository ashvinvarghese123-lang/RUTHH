import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";

const profileSelect = {
  id: true,
  username: true,
  profile: { select: { displayName: true, profilePhoto: true } },
};

export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;
  const meId = req.user!.userId;

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) throw new ApiError(404, "No Ruth user found with that username.");
  if (target.id === meId) throw new ApiError(400, "You can't friend yourself.");

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: meId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: meId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") throw new ApiError(409, "You're already friends.");
    throw new ApiError(409, "A friend request already exists between you two.");
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: meId, addresseeId: target.id, status: "PENDING" },
  });

  const me = await prisma.profile.findUnique({ where: { userId: meId } });
  await prisma.notification.create({
    data: {
      userId: target.id,
      type: "FRIEND_REQUEST",
      title: "New friend request",
      body: `${me?.displayName ?? "Someone"} wants to be friends.`,
      metadata: { friendshipId: friendship.id },
    },
  });

  return ok(res, { friendship }, 201);
});

export const acceptFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const { friendshipId } = req.params;
  const meId = req.user!.userId;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) throw new ApiError(404, "Friend request not found.");
  if (friendship.addresseeId !== meId) throw new ApiError(403, "This request isn't addressed to you.");
  if (friendship.status !== "PENDING") throw new ApiError(400, "This request has already been handled.");

  const updated = await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });

  const me = await prisma.profile.findUnique({ where: { userId: meId } });
  await prisma.notification.create({
    data: {
      userId: friendship.requesterId,
      type: "FRIEND_ACCEPTED",
      title: "Friend request accepted",
      body: `${me?.displayName ?? "Someone"} accepted your friend request.`,
    },
  });

  return ok(res, { friendship: updated });
});

export const declineFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const { friendshipId } = req.params;
  const meId = req.user!.userId;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) throw new ApiError(404, "Friend request not found.");
  if (friendship.addresseeId !== meId) throw new ApiError(403, "This request isn't addressed to you.");

  await prisma.friendship.delete({ where: { id: friendshipId } });
  return ok(res, { declined: true });
});

/** Cancel a request you sent, or unfriend someone you're already friends with. */
export const removeFriendship = asyncHandler(async (req: Request, res: Response) => {
  const { friendshipId } = req.params;
  const meId = req.user!.userId;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) throw new ApiError(404, "Friendship not found.");
  if (friendship.requesterId !== meId && friendship.addresseeId !== meId) {
    throw new ApiError(403, "This isn't your friendship to remove.");
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });
  return ok(res, { removed: true });
});

export const listFriends = asyncHandler(async (req: Request, res: Response) => {
  const meId = req.user!.userId;

  const friendships = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ requesterId: meId }, { addresseeId: meId }] },
    include: {
      requester: { select: profileSelect },
      addressee: { select: profileSelect },
    },
    orderBy: { updatedAt: "desc" },
  });

  const friends = friendships.map((f) => (f.requesterId === meId ? f.addressee : f.requester));
  return ok(res, { friends, count: friends.length });
});

export const listFriendRequests = asyncHandler(async (req: Request, res: Response) => {
  const meId = req.user!.userId;

  const [incoming, outgoing] = await Promise.all([
    prisma.friendship.findMany({
      where: { addresseeId: meId, status: "PENDING" },
      include: { requester: { select: profileSelect } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { requesterId: meId, status: "PENDING" },
      include: { addressee: { select: profileSelect } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return ok(res, { incoming, outgoing });
});

/** Relationship status between the current user and :username — drives the profile page's action button. */
export const getFriendStatus = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const meId = req.user!.userId;

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) throw new ApiError(404, "User not found.");

  if (target.id === meId) return ok(res, { status: "SELF" });

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: meId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: meId },
      ],
    },
  });

  if (!friendship) return ok(res, { status: "NONE" });
  if (friendship.status === "ACCEPTED") return ok(res, { status: "FRIENDS", friendshipId: friendship.id });
  if (friendship.requesterId === meId) return ok(res, { status: "REQUEST_SENT", friendshipId: friendship.id });
  return ok(res, { status: "REQUEST_RECEIVED", friendshipId: friendship.id });
});

/** Simple username search, for finding people to friend. */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  const meId = req.user!.userId;
  if (!q) return ok(res, { users: [] });

  const users = await prisma.user.findMany({
    where: { username: { contains: q, mode: "insensitive" }, id: { not: meId } },
    select: profileSelect,
    take: 10,
  });

  return ok(res, { users });
});
