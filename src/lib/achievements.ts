import { prisma } from "./prisma";
import type { AchievementKey } from "./achievement-defs";

export { ACHIEVEMENTS, type AchievementKey } from "./achievement-defs";
export { formatAchievementToast } from "./achievement-defs";

export async function unlockAchievement(
  userId: string,
  key: AchievementKey,
): Promise<boolean> {
  const { count } = await prisma.userAchievement.createMany({
    data: [{ userId, key }],
    skipDuplicates: true,
  });
  return count > 0;
}

export async function checkAndUnlockAchievements(userId: string) {
  const [pet, wins, casinhaPost, existing] = await Promise.all([
    prisma.pet.findUnique({
      where: { userId },
      select: { dailyStreak: true },
    }),
    prisma.petBattle.count({
      where: {
        status: "ENDED",
        winnerId: userId,
      },
    }),
    prisma.post.findFirst({
      where: { authorId: userId, communityLevel: { not: null } },
      select: { id: true },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { key: true },
    }),
  ]);

  const have = new Set(existing.map((a) => a.key));

  if (!have.has("DAILY_STREAK_7") && (pet?.dailyStreak ?? 0) >= 7) {
    await unlockAchievement(userId, "DAILY_STREAK_7");
  }
  if (!have.has("BATTLE_CHAMP_5") && wins >= 5) {
    await unlockAchievement(userId, "BATTLE_CHAMP_5");
  }
  if (!have.has("CASINHA_FIRST") && casinhaPost) {
    await unlockAchievement(userId, "CASINHA_FIRST");
  }
}
