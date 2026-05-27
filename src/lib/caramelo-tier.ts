import { prisma } from "./prisma";

export type CarameloTier = "NONE" | "BRONZE" | "SILVER" | "GOLD";

export type CarameloTierInfo = {
  tier: CarameloTier;
  label: string;
  emoji: string;
  score: number;
};

const TIER_THRESHOLDS: { tier: CarameloTier; min: number; label: string; emoji: string }[] = [
  { tier: "GOLD", min: 80, label: "Caramelo de Ouro", emoji: "🥇" },
  { tier: "SILVER", min: 50, label: "Caramelo de Prata", emoji: "🥈" },
  { tier: "BRONZE", min: 25, label: "Caramelo Bronze", emoji: "🥉" },
];

/** Selo Caramelo Verificado — perfil, depoimentos e Matilha. */
export async function computeCarameloTier(userId: string): Promise<CarameloTierInfo> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [user, testimonials, packThreads, packReplies] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { bio: true, avatarUrl: true, updatedAt: true, createdAt: true },
    }),
    prisma.testimonial.count({
      where: { toUserId: userId, accepted: true },
    }),
    prisma.thread.count({ where: { authorId: userId } }),
    prisma.reply.count({ where: { authorId: userId } }),
  ]);

  let score = 0;
  if (user?.bio?.trim()) score += 10;
  if (user?.avatarUrl) score += 10;
  if (user && user.updatedAt > thirtyDaysAgo) score += 15;
  score += Math.min(testimonials * 8, 40);
  score += Math.min(packThreads * 5, 25);
  score += Math.min(packReplies * 2, 20);

  for (const t of TIER_THRESHOLDS) {
    if (score >= t.min) {
      return { tier: t.tier, label: t.label, emoji: t.emoji, score };
    }
  }

  return { tier: "NONE", label: "", emoji: "", score };
}
