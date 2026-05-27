import { prisma } from "./prisma";
import { VISIBLE_POST_WHERE } from "./visible-posts";

export type MemoryPost = {
  id: string;
  content: string;
  createdAt: Date;
  packName: string | null;
};

/** Post do mesmo dia do ano passado (Túnel do Tempo). */
export async function getOnThisDayMemory(
  userId: string,
): Promise<MemoryPost | null> {
  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(now.getFullYear() - 1);

  const dayStart = new Date(yearAgo);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(yearAgo);
  dayEnd.setHours(23, 59, 59, 999);

  const post = await prisma.post.findFirst({
    where: {
      authorId: userId,
      createdAt: { gte: dayStart, lte: dayEnd },
      ...VISIBLE_POST_WHERE,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      communityLevel: true,
    },
  });

  if (!post) return null;

  let packName: string | null = null;
  if (post.communityLevel) {
    packName = `Casinha ${post.communityLevel.replace(/_/g, " ")}`;
  }

  return {
    id: post.id,
    content: post.content.slice(0, 280),
    createdAt: post.createdAt,
    packName,
  };
}
