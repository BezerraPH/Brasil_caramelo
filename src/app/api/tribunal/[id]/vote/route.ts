import { NextResponse } from "next/server";
import { z } from "zod";
import { unlockAchievement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { isTribunalJuror } from "@/lib/pet-dna";
import { prisma } from "@/lib/prisma";
import { resolveTribunalCaseIfReady } from "@/lib/tribunal";
import {
  TRIBUNAL_JURY_COINS,
  TRIBUNAL_JURY_COINS_DAILY_CAP,
} from "@/lib/tribunal-constants";

type RouteContext = { params: Promise<{ id: string }> };

const voteSchema = z.object({
  choice: z.enum(["KEEP", "REMOVE"]),
  opinion: z.string().max(280).optional(),
});

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!(await isTribunalJuror(user.id))) {
    return NextResponse.json(
      {
        error:
          "Só jurados com personalidade Border Collie ou Poodle podem votar.",
      },
      { status: 403 },
    );
  }

  const { id: caseId } = await context.params;

  try {
    const { choice, opinion } = voteSchema.parse(await request.json());
    const parecer =
      opinion?.trim().slice(0, 280) || undefined;
    const tribunalCase = await prisma.postTribunalCase.findUnique({
      where: { id: caseId },
      include: { post: { select: { authorId: true } } },
    });

    if (!tribunalCase || tribunalCase.status !== "OPEN") {
      return NextResponse.json({ error: "Caso encerrado ou inexistente." }, { status: 404 });
    }
    if (tribunalCase.post.authorId === user.id) {
      return NextResponse.json(
        { error: "Autor do recado não pode ser jurado neste caso." },
        { status: 403 },
      );
    }

    try {
      await prisma.tribunalVote.create({
        data: { caseId, jurorId: user.id, choice, opinion: parecer },
      });
    } catch {
      return NextResponse.json({ error: "Você já votou neste caso." }, { status: 400 });
    }

    await prisma.postTribunalCase.update({
      where: { id: caseId },
      data: {
        votesKeep: { increment: choice === "KEEP" ? 1 : 0 },
        votesRemove: { increment: choice === "REMOVE" ? 1 : 0 },
      },
    });

    await resolveTribunalCaseIfReady(caseId);
    const unlocked = await unlockAchievement(user.id, "TRIBUNAL_JUROR");

    if (parecer) {
      const { createNotification } = await import("@/lib/notifications");
      const juror = await prisma.user.findUnique({
        where: { id: user.id },
        select: { username: true },
      });
      await createNotification(
        tribunalCase.post.authorId,
        "TRIBUNAL_CASE",
        `⚖️ @${juror?.username ?? "jurado"} deixou parecer no Tribunal sobre seu recado.`,
        "/tribunal",
      );
    }

    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const votesToday = await prisma.tribunalVote.count({
      where: { jurorId: user.id, createdAt: { gte: dayStart } },
    });

    let coinsAwarded = 0;
    if (votesToday <= TRIBUNAL_JURY_COINS_DAILY_CAP) {
      let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
      if (!pet) {
        pet = await prisma.pet.create({
          data: { userId: user.id, coins: TRIBUNAL_JURY_COINS },
        });
      } else {
        await prisma.pet.update({
          where: { id: pet.id },
          data: { coins: pet.coins + TRIBUNAL_JURY_COINS },
        });
      }
      coinsAwarded = TRIBUNAL_JURY_COINS;
    }

    const updated = await prisma.postTribunalCase.findUnique({
      where: { id: caseId },
    });

    return NextResponse.json({
      ok: true,
      status: updated?.status ?? "OPEN",
      newAchievement: unlocked ? "TRIBUNAL_JUROR" : null,
      coinsAwarded,
    });
  } catch {
    return NextResponse.json({ error: "Voto inválido." }, { status: 400 });
  }
}
