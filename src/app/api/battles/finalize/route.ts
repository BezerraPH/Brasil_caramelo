import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const expired = await prisma.petBattle.findMany({
    where: { status: "ACTIVE", endsAt: { lte: now } },
  });

  for (const battle of expired) {
    const winnerId =
      battle.votesChallenger >= battle.votesOpponent
        ? battle.challengerId
        : battle.opponentId;

    await prisma.petBattle.update({
      where: { id: battle.id },
      data: { status: "ENDED", winnerId },
    });

    const loserId =
      winnerId === battle.challengerId ? battle.opponentId : battle.challengerId;

    for (const uid of [winnerId, loserId]) {
      let pet = await prisma.pet.findUnique({ where: { userId: uid } });
      if (!pet) pet = await prisma.pet.create({ data: { userId: uid } });
      await prisma.pet.update({
        where: { id: pet.id },
        data: {
          coins: pet.coins + (uid === winnerId ? 40 : 10),
          experience: pet.experience + (uid === winnerId ? 30 : 10),
        },
      });
    }
  }

  return NextResponse.json({ finalized: expired.length });
}
