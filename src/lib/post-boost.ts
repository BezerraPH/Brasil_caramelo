import { prisma } from "./prisma";

export { BOOST_COST_COINS, BOOST_DURATION_MS } from "./post-boost-constants";

export async function expirePostBoosts() {
  const now = new Date();
  await prisma.post.updateMany({
    where: {
      boostPriority: { gt: 0 },
      OR: [{ boostedUntil: { lte: now } }, { boostedUntil: null }],
    },
    data: { boostPriority: 0 },
  });
}

export function isPostBoosted(boostedUntil: Date | null | undefined): boolean {
  if (!boostedUntil) return false;
  return boostedUntil.getTime() > Date.now();
}
