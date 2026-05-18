import { prisma } from "./prisma";

export const ACHIEVEMENTS = {
  DAILY_STREAK_7: {
    key: "DAILY_STREAK_7",
    title: "Dono exemplar",
    emoji: "🏅",
    desc: "7 dias seguidos de missão diária",
  },
  BATTLE_CHAMP_5: {
    key: "BATTLE_CHAMP_5",
    title: "Rei da Matilha",
    emoji: "👑",
    desc: "Venceu 5 batalhas de fofura",
  },
  CASINHA_FIRST: {
    key: "CASINHA_FIRST",
    title: "Cidadão da Casinha",
    emoji: "🏠",
    desc: "Primeiro recado em uma casinha",
  },
} as const;

export type AchievementKey = keyof typeof ACHIEVEMENTS;

export async function unlockAchievement(
  userId: string,
  key: AchievementKey,
): Promise<boolean> {
  try {
    await prisma.userAchievement.create({
      data: { userId, key },
    });
    return true;
  } catch {
    return false;
  }
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
