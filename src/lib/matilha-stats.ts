import { prisma } from "./prisma";

export async function getMatilhaStats() {
  const now = new Date();
  const [users, posts, boosted, pets, mirrors] = await Promise.all([
    prisma.user.count({ where: { shadowbanned: false } }),
    prisma.post.count({ where: { communityLevel: null } }),
    prisma.post.count({
      where: { boostedUntil: { gt: now }, boostPriority: { gt: 0 } },
    }),
    prisma.pet.count(),
    prisma.federatedPostMirror.count(),
  ]);

  return { users, posts, boosted, pets, mirrors };
}
