import { prisma } from "./prisma";

/** IDs do usuário + amigos aceitos (para feed “só matilha”). */
export async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  const ids = new Set<string>([userId]);
  for (const row of rows) {
    ids.add(row.requesterId === userId ? row.addresseeId : row.requesterId);
  }
  return [...ids];
}

export async function areFriends(userId: string, otherId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId, addresseeId: otherId },
        { requesterId: otherId, addresseeId: userId },
      ],
    },
  });
  return !!friendship;
}

export async function countMutualTreats(userId: string, otherId: string) {
  return prisma.petTreat.count({
    where: {
      OR: [
        { fromUserId: userId, toUserId: otherId },
        { fromUserId: otherId, toUserId: userId },
      ],
    },
  });
}
