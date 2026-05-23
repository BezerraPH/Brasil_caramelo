import { MATILHA_POST_WHERE } from "./matilha-post-where";
import { prisma } from "./prisma";
import { summarizeReputation } from "./reputation";
import { BOOST_COST_COINS } from "./post-boost-constants";

/** Contexto RAG leve para o Cão de Guarda (dados reais do usuário). */
export async function buildGuardDogRagContext(userId: string): Promise<string> {
  const now = new Date();

  const [
    user,
    pet,
    postCount,
    boostedActive,
    offspringCount,
    achievements,
    reportsOnPosts,
    reps,
    openTribunalOnPosts,
    redemptions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, isPremium: true, premiumUntil: true, shadowbanned: true },
    }),
    prisma.pet.findUnique({
      where: { userId },
      select: { name: true, level: true, coins: true, dailyStreak: true },
    }),
    prisma.post.count({ where: { authorId: userId, ...MATILHA_POST_WHERE } }),
    prisma.post.count({
      where: {
        authorId: userId,
        ...MATILHA_POST_WHERE,
        boostedUntil: { gt: now },
      },
    }),
    prisma.petOffspring.count({ where: { ownerId: userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { key: true },
      take: 12,
    }),
    prisma.postReport.count({ where: { post: { authorId: userId } } }),
    prisma.reputation.findMany({
      where: { toUserId: userId },
      select: { level: true },
    }),
    prisma.postTribunalCase.count({
      where: {
        status: "OPEN",
        post: { authorId: userId },
      },
    }),
    prisma.petShopRedemption.count({ where: { userId } }),
  ]);

  const dominant = summarizeReputation(reps.map((r) => r.level)).dominant;
  const lines: string[] = [];

  if (user) {
    lines.push(`@${user.username}${user.isPremium ? " (Pedigree)" : ""}.`);
    if (user.shadowbanned) {
      lines.push("Conta com shadowban leve por denúncias acumuladas.");
    }
  }

  if (pet) {
    lines.push(
      `Pet "${pet.name}" nível ${pet.level}, ${pet.coins} CarameloCoins, streak diário ${pet.dailyStreak}.`,
    );
  } else {
    lines.push("Sem pet — crie em /cachorro.");
  }

  lines.push(`${postCount} recado(s) visíveis no feed.`);
  if (boostedActive > 0) {
    lines.push(`${boostedActive} recado(s) impulsionado(s) agora (custa ${BOOST_COST_COINS} moedas / 2h).`);
  }
  lines.push(`${offspringCount} filhote(s) DNA Caramelo, ${redemptions} cupom(ns) pet shop resgatado(s).`);
  lines.push(`${reportsOnPosts} denúncia(s) recebida(s) nos recados.`);
  if (openTribunalOnPosts > 0) {
    lines.push(`${openTribunalOnPosts} recado(s) no Tribunal do Cão (aberto).`);
  }
  if (dominant) {
    lines.push(`Personalidade dominante: ${dominant.breed} (${dominant.level}).`);
  }
  if (achievements.length > 0) {
    lines.push(`Conquistas: ${achievements.map((a) => a.key).join(", ")}.`);
  }

  return lines.join("\n");
}
