import { createNotification } from "./notifications";
import { TRIBUNAL_JUROR_LEVELS } from "./pet-dna";
import { prisma } from "./prisma";
import { summarizeReputation } from "./reputation";

async function notifyEligibleJurors(): Promise<void> {
  const candidates = await prisma.user.findMany({
    where: {
      reputationsReceived: {
        some: { level: { in: ["BORDER_COLLIE", "POODLE"] } },
      },
    },
    select: {
      id: true,
      reputationsReceived: { select: { level: true } },
    },
    take: 80,
  });

  const notified = new Set<string>();

  for (const u of candidates) {
    const dominant = summarizeReputation(
      u.reputationsReceived.map((r) => r.level),
    ).dominant;
    if (!dominant || !TRIBUNAL_JUROR_LEVELS.has(dominant.level)) continue;
    if (notified.has(u.id)) continue;
    notified.add(u.id);
    await createNotification(
      u.id,
      "TRIBUNAL_CASE",
      "⚖️ Novo caso no Tribunal do Cão — sua matilha precisa de um jurado.",
      "/tribunal",
    );
  }
}

/** Notifica autor e jurados quando um caso é aberto. */
export async function notifyTribunalOpened(postId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) return;

  await createNotification(
    post.authorId,
    "TRIBUNAL_CASE",
    "⚖️ Seu recado foi ao Tribunal do Cão por denúncias acumuladas.",
    "/tribunal",
  );

  await notifyEligibleJurors();
}
