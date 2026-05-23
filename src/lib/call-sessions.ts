import { prisma } from "./prisma";

const STALE_MS = 3 * 60 * 1000;

/** Encerra chamadas RINGING/ACTIVE antigas que ficaram travadas (evita 409). */
export async function expireStaleCallsForUsers(
  userId: string,
  peerUserId?: string,
) {
  const cutoff = new Date(Date.now() - STALE_MS);
  const peerFilter = peerUserId
    ? {
        OR: [
          { callerId: userId, calleeId: peerUserId },
          { callerId: peerUserId, calleeId: userId },
        ],
      }
    : {
        OR: [{ callerId: userId }, { calleeId: userId }],
      };

  await prisma.callSession.updateMany({
    where: {
      status: { in: ["RINGING", "ACTIVE"] },
      createdAt: { lt: cutoff },
      ...peerFilter,
    },
    data: { status: "ENDED", endedAt: new Date() },
  });
}
