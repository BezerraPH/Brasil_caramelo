import { prisma } from "./prisma";
import { MATILHA_POST_WHERE } from "./matilha-post-where";

export async function getMatilhaStats() {
  const now = new Date();
  const [users, posts, boosted, pets, mirrors] = await Promise.all([
    prisma.user.count({ where: { shadowbanned: false } }),
    prisma.post.count({ where: MATILHA_POST_WHERE }),
    prisma.post.count({
      where: {
        ...MATILHA_POST_WHERE,
        boostedUntil: { gt: now },
        boostPriority: { gt: 0 },
      },
    }),
    prisma.pet.count(),
    prisma.federatedPostMirror.count(),
  ]);

  return { users, posts, boosted, pets, mirrors };
}
