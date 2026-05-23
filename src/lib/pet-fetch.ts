import { MATILHA_POST_WITH_AUTHOR } from "./matilha-post-where";
import { getFriendIds } from "./friendship";
import { prisma } from "./prisma";

const FETCH_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function canPetFetch(lastFetchAt: Date | null | undefined): boolean {
  if (!lastFetchAt) return true;
  return Date.now() - lastFetchAt.getTime() >= FETCH_COOLDOWN_MS;
}

export type FetchReward =
  | { type: "memory"; postId: string; preview: string; authorName: string }
  | { type: "coins"; coins: number }
  | { type: "xp"; xp: number };

export async function rollPetFetchReward(
  userId: string,
): Promise<FetchReward> {
  const friendIds = await getFriendIds(userId);
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  if (friendIds.length > 0 && Math.random() < 0.55) {
    const memories = await prisma.post.findMany({
      where: {
        authorId: { in: friendIds },
        createdAt: { lte: yearAgo },
        ...MATILHA_POST_WITH_AUTHOR,
      },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true,
        content: true,
        author: { select: { name: true } },
      },
    });
    const memory =
      memories.length > 0
        ? memories[Math.floor(Math.random() * memories.length)]
        : null;
    if (memory) {
      const preview =
        memory.content.slice(0, 120) || "Um recado antigo da matilha…";
      return {
        type: "memory",
        postId: memory.id,
        preview,
        authorName: memory.author.name,
      };
    }
  }

  if (Math.random() < 0.5) {
    return { type: "coins", coins: 15 + Math.floor(Math.random() * 25) };
  }
  return { type: "xp", xp: 12 + Math.floor(Math.random() * 18) };
}
