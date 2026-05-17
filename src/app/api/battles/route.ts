import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friendship";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { pushGlobalEvent } from "@/lib/pusher-server";

const createSchema = z.object({ opponentId: z.string().min(1) });
const voteSchema = z.object({
  battleId: z.string().min(1),
  forChallenger: z.boolean(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const battles = await prisma.petBattle.findMany({
    where: {
      status: "ACTIVE",
      endsAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      challenger: { select: { id: true, name: true, username: true, avatarUrl: true } },
      opponent: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({ battles });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();

  if (body.battleId !== undefined) {
    try {
      const { battleId, forChallenger } = voteSchema.parse(body);
      const battle = await prisma.petBattle.findUnique({ where: { id: battleId } });
      if (!battle || battle.status !== "ACTIVE" || battle.endsAt < new Date()) {
        return NextResponse.json({ error: "Batalha encerrada." }, { status: 400 });
      }
      if (battle.challengerId === user.id || battle.opponentId === user.id) {
        return NextResponse.json(
          { error: "Participantes não podem votar." },
          { status: 400 },
        );
      }

      await prisma.petBattleVote.upsert({
        where: {
          battleId_userId: { battleId, userId: user.id },
        },
        create: { battleId, userId: user.id, forChallenger },
        update: { forChallenger },
      });

      const [votesChallenger, votesOpponent] = await Promise.all([
        prisma.petBattleVote.count({
          where: { battleId, forChallenger: true },
        }),
        prisma.petBattleVote.count({
          where: { battleId, forChallenger: false },
        }),
      ]);

      const updated = await prisma.petBattle.update({
        where: { id: battleId },
        data: { votesChallenger, votesOpponent },
      });

      await pushGlobalEvent("battle-update", {
        battleId,
        votesChallenger,
        votesOpponent,
      });

      return NextResponse.json({ battle: updated });
    } catch {
      return NextResponse.json({ error: "Voto inválido." }, { status: 400 });
    }
  }

  try {
    const { opponentId } = createSchema.parse(body);
    if (opponentId === user.id) {
      return NextResponse.json({ error: "Oponente inválido." }, { status: 400 });
    }
    if (!(await areFriends(user.id, opponentId))) {
      return NextResponse.json({ error: "Só entre amigos." }, { status: 403 });
    }

    const endsAt = new Date();
    endsAt.setMinutes(endsAt.getMinutes() + 10);

    const battle = await prisma.petBattle.create({
      data: {
        challengerId: user.id,
        opponentId,
        endsAt,
      },
      include: {
        challenger: { select: { name: true, username: true } },
        opponent: { select: { name: true, username: true } },
      },
    });

    await createNotification(
      opponentId,
      "PET_BATTLE",
      `${user.name} desafiou seu pet para uma batalha de fofura!`,
      "/batalha",
    );

    await pushGlobalEvent("battle-new", { battleId: battle.id });

    return NextResponse.json({ battle });
  } catch {
    return NextResponse.json({ error: "Desafio inválido." }, { status: 400 });
  }
}
