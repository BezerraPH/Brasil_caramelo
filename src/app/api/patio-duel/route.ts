import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friendship";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { applyPetDecay } from "@/lib/pet";

const KING_HOURS = 24;

function petPower(pet: { level: number; happiness: number; energy: number }) {
  return pet.level * 10 + pet.happiness + pet.energy;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { opponentId } = (await request.json()) as { opponentId?: string };
    if (!opponentId || opponentId === user.id) {
      return NextResponse.json({ error: "Oponente inválido." }, { status: 400 });
    }

    const friends = await areFriends(user.id, opponentId);
    if (!friends) {
      return NextResponse.json(
        { error: "Só amigos podem duelar no pátio." },
        { status: 403 },
      );
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.patioDuel.count({
      where: {
        createdAt: { gte: dayAgo },
        OR: [
          { challengerId: user.id, opponentId },
          { challengerId: opponentId, opponentId: user.id },
        ],
      },
    });
    if (recent >= 3) {
      return NextResponse.json(
        { error: "Limite de 3 duelos por dia com este amigo." },
        { status: 429 },
      );
    }

    const [myPet, theirPet, opponent] = await Promise.all([
      prisma.pet.findUnique({ where: { userId: user.id } }),
      prisma.pet.findUnique({ where: { userId: opponentId } }),
      prisma.user.findUnique({
        where: { id: opponentId },
        select: { name: true, username: true },
      }),
    ]);

    if (!myPet || !theirPet || !opponent) {
      return NextResponse.json({ error: "Pets não encontrados." }, { status: 404 });
    }

    const myStats = applyPetDecay(myPet);
    const theirStats = applyPetDecay(theirPet);
    const myPower = petPower(myStats);
    const theirPower = petPower(theirStats);
    const roll = Math.random() * (myPower + theirPower);
    const iWin = roll < myPower;
    const winnerId = iWin ? user.id : opponentId;

    await prisma.patioDuel.create({
      data: {
        challengerId: user.id,
        opponentId,
        winnerId,
      },
    });

    const kingUntil = new Date(Date.now() + KING_HOURS * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: winnerId },
      data: { patioKingUntil: kingUntil },
    });

    const winnerPet = iWin ? myPet : theirPet;
    const loserPet = iWin ? theirPet : myPet;

    await createNotification(
      opponentId,
      "PATIO_DUEL",
      iWin
        ? `${user.name} venceu o duelo! ${winnerPet.name} derrotou ${loserPet.name}.`
        : `Você venceu o duelo de pátio! ${winnerPet.name} é o Rei por 24h 👑`,
      `/perfil/${iWin ? user.username : opponent.username}`,
    );

    if (iWin) {
      await createNotification(
        user.id,
        "PATIO_DUEL",
        `Você é o Rei do Pátio por 24h! ${myPet.name} venceu ${theirPet.name}.`,
        `/perfil/${user.username}`,
      );
    }

    return NextResponse.json({
      ok: true,
      won: iWin,
      winnerPet: winnerPet.name,
      loserPet: loserPet.name,
      kingUntil: kingUntil.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Duelo inválido." }, { status: 400 });
  }
}
