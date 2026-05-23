import { prisma } from "./prisma";

/** Limite de denúncias por recado para abrir caso no Tribunal. */
export const TRIBUNAL_REPORT_THRESHOLD = 3;

/** Votos mínimos de jurados para encerrar um caso. */
export const TRIBUNAL_MIN_JURY_VOTES = 3;

export async function maybeOpenTribunalCase(postId: string): Promise<boolean> {
  const existing = await prisma.postTribunalCase.findUnique({
    where: { postId },
  });
  if (existing) return false;

  const reportCount = await prisma.postReport.count({ where: { postId } });
  if (reportCount < TRIBUNAL_REPORT_THRESHOLD) return false;

  await prisma.postTribunalCase.create({
    data: { postId },
  });
  const { notifyTribunalOpened } = await import("./tribunal-notify");
  void notifyTribunalOpened(postId);
  return true;
}

export async function resolveTribunalCaseIfReady(caseId: string): Promise<void> {
  const tribunalCase = await prisma.postTribunalCase.findUnique({
    where: { id: caseId },
    include: { post: { select: { authorId: true } } },
  });
  if (!tribunalCase || tribunalCase.status !== "OPEN") return;

  const totalVotes = tribunalCase.votesKeep + tribunalCase.votesRemove;
  if (totalVotes < TRIBUNAL_MIN_JURY_VOTES) return;

  const removeWins = tribunalCase.votesRemove > tribunalCase.votesKeep;
  const status = removeWins ? "REMOVED" : "KEEP";

  await prisma.$transaction([
    prisma.postTribunalCase.update({
      where: { id: caseId },
      data: { status, resolvedAt: new Date() },
    }),
    ...(removeWins
      ? [
          prisma.post.update({
            where: { id: tribunalCase.postId },
            data: { tribunalHidden: true },
          }),
        ]
      : []),
  ]);

  if (removeWins) {
    const { createNotification } = await import("./notifications");
    await createNotification(
      tribunalCase.post.authorId,
      "TRIBUNAL_CASE",
      "⚖️ O Tribunal do Cão removeu seu recado da matilha.",
      "/tribunal",
    );
  } else {
    const { createNotification } = await import("./notifications");
    await createNotification(
      tribunalCase.post.authorId,
      "TRIBUNAL_CASE",
      "⚖️ O Tribunal manteve seu recado — mal-entendido da matilha.",
      "/tribunal",
    );
  }
}
