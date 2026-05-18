import { NextResponse } from "next/server";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { applyPetDecay } from "@/lib/pet";
import { prisma } from "@/lib/prisma";

const DAILY_COINS = 25;
const DAILY_XP = 15;

function isSameUtcDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isYesterdayUtc(last: Date, now: Date) {
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  return isSameUtcDay(last, y);
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) {
    pet = await prisma.pet.create({ data: { userId: user.id } });
  }

  const now = new Date();
  if (pet.lastDailyClaim && isSameUtcDay(pet.lastDailyClaim, now)) {
    return NextResponse.json(
      { error: "Você já resgatou a recompensa de hoje. Volte amanhã!" },
      { status: 400 },
    );
  }

  let dailyStreak = 1;
  if (pet.lastDailyClaim && isYesterdayUtc(pet.lastDailyClaim, now)) {
    dailyStreak = pet.dailyStreak + 1;
  }

  const decayed = applyPetDecay(pet);
  const experience = decayed.experience + DAILY_XP;
  const leveled = experience >= 100;
  const updated = await prisma.pet.update({
    where: { id: pet.id },
    data: {
      coins: decayed.coins + DAILY_COINS,
      experience: leveled ? experience - 100 : experience,
      level: leveled ? decayed.level + 1 : decayed.level,
      lastDailyClaim: now,
      dailyStreak,
      hunger: decayed.hunger,
      happiness: Math.min(100, decayed.happiness + 5),
      energy: decayed.energy,
    },
  });

  void checkAndUnlockAchievements(user.id);

  return NextResponse.json({
    ok: true,
    reward: { coins: DAILY_COINS, xp: DAILY_XP },
    pet: updated,
    dailyStreak,
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet?.lastDailyClaim) {
    return NextResponse.json({ canClaim: true, dailyStreak: pet?.dailyStreak ?? 0 });
  }

  const canClaim = !isSameUtcDay(pet.lastDailyClaim, new Date());
  return NextResponse.json({ canClaim, dailyStreak: pet.dailyStreak });
}
