import { prisma } from "./prisma";

export type PackWithActivity = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  threadCount: number;
  joined: boolean;
  createdAt: string;
  activityScore: number;
  recentReplies: number;
};

/** Score de atividade (tópicos + respostas recentes) para sort=hot. */
export async function scorePackActivity(
  packIds: string[],
): Promise<Map<string, { score: number; recentReplies: number }>> {
  if (packIds.length === 0) return new Map();

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [threads, replies] = await Promise.all([
    prisma.thread.groupBy({
      by: ["packId"],
      where: { packId: { in: packIds }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.reply.findMany({
      where: {
        createdAt: { gte: since },
        thread: { packId: { in: packIds } },
      },
      select: { thread: { select: { packId: true } } },
    }),
  ]);

  const replyCount = new Map<string, number>();
  for (const r of replies) {
    const pid = r.thread.packId;
    replyCount.set(pid, (replyCount.get(pid) ?? 0) + 1);
  }

  const out = new Map<string, { score: number; recentReplies: number }>();
  for (const id of packIds) {
    const t = threads.find((x) => x.packId === id)?._count._all ?? 0;
    const r = replyCount.get(id) ?? 0;
    out.set(id, { score: t * 3 + r, recentReplies: r });
  }
  return out;
}
