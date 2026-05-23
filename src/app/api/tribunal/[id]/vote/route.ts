import { NextResponse } from "next/server";
import { z } from "zod";
import { unlockAchievement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { isTribunalJuror } from "@/lib/pet-dna";
import { prisma } from "@/lib/prisma";
import { resolveTribunalCaseIfReady } from "@/lib/tribunal";

type RouteContext = { params: Promise<{ id: string }> };

const voteSchema = z.object({
  choice: z.enum(["KEEP", "REMOVE"]),
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
    const { choice } = voteSchema.parse(await request.json());
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
        data: { caseId, jurorId: user.id, choice },
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

    const updated = await prisma.postTribunalCase.findUnique({
      where: { id: caseId },
    });

    return NextResponse.json({
      ok: true,
      status: updated?.status ?? "OPEN",
      newAchievement: unlocked ? "TRIBUNAL_JUROR" : null,
    });
  } catch {
    return NextResponse.json({ error: "Voto inválido." }, { status: 400 });
  }
}
