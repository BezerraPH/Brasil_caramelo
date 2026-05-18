import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 6, 60_000, "battle-finalize")) {
    return NextResponse.json(
      { error: "Muitas finalizações em pouco tempo. Aguarde um minuto." },
      { status: 429 },
    );
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
