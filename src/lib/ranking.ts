import type { DogReputationLevel } from "@/generated/prisma/enums";
import { DOG_REPUTATION_LEVELS } from "./constants";
import { prisma } from "./prisma";

export type PackLeader = {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  voteCount: number;
};

export async function getWeeklyPackRanking(
  level: DogReputationLevel,
  limit = 10,
): Promise<PackLeader[]> {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const grouped = await prisma.reputation.groupBy({
    by: ["toUserId"],
    where: { level, createdAt: { gte: since } },
    _count: { level: true },
    orderBy: { _count: { level: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.toUserId) } },
    select: { id: true, name: true, username: true, avatarUrl: true },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return grouped
    .map((g) => {
      const u = userMap[g.toUserId];
      if (!u) return null;
      return {
        userId: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        voteCount: g._count.level,
      };
    })
    .filter((x): x is PackLeader => x !== null);
}

export async function getAllPackRankings() {
  const results = await Promise.all(
    DOG_REPUTATION_LEVELS.map(async (level) => ({
      level,
      leaders: await getWeeklyPackRanking(level),
    })),
  );
  return results;
}
