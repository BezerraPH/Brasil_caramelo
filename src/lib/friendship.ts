import { prisma } from "./prisma";

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
