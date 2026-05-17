import { prisma } from "./prisma";

export async function finalizeExpiredBattles() {
  const now = new Date();
  const expired = await prisma.petBattle.findMany({
    where: { status: "ACTIVE", endsAt: { lte: now } },
  });

  for (const battle of expired) {
    const winnerId =
      battle.votesChallenger >= battle.votesOpponent
        ? battle.challengerId
        : battle.opponentId;
    const loserId =
      winnerId === battle.challengerId ? battle.opponentId : battle.challengerId;

    await prisma.petBattle.update({
      where: { id: battle.id },
      data: { status: "ENDED", winnerId },
    });

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

  return expired.length;
}
