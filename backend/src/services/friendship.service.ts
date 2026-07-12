import { prisma } from "../config/db";

/** Returns true if the two users have an accepted friendship (in either direction). */
export async function areFriends(userIdA: string, userIdB: string): Promise<boolean> {
  if (userIdA === userIdB) return true;
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userIdA, addresseeId: userIdB },
        { requesterId: userIdB, addresseeId: userIdA },
      ],
    },
    select: { id: true },
  });
  return Boolean(friendship);
}

/** Returns the user IDs of everyone `userId` is accepted-friends with. */
export async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return friendships.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
}

/**
 * Whether `viewerId` is allowed to view `entry` based on its visibility,
 * ownership, and friendship with the owner. Does NOT account for direct
 * SharedEntry grants — callers that need to honor those should check
 * separately (see journal.controller.getJournal).
 */
export async function canViewByVisibility(
  entryOwnerId: string,
  entryVisibility: "PUBLIC" | "FRIENDS" | "PRIVATE",
  viewerId: string | undefined
): Promise<boolean> {
  if (viewerId === entryOwnerId) return true;
  if (entryVisibility === "PUBLIC") return true;
  if (entryVisibility === "PRIVATE") return false;
  if (!viewerId) return false;
  return areFriends(entryOwnerId, viewerId);
}
