import type { DogReputationLevel } from "@/generated/prisma/enums";
import { prisma } from "./prisma";
import { summarizeReputation } from "./reputation";

export async function getActiveFlashEvent(userId?: string) {
  const now = new Date();
  const event = await prisma.flashEvent.findFirst({
    where: { endsAt: { gt: now } },
    orderBy: { endsAt: "asc" },
  });
  if (!event) return null;

  if (event.targetLevel && userId) {
    const reps = await prisma.reputation.findMany({
      where: { toUserId: userId },
      select: { level: true },
    });
    const summary = summarizeReputation(reps.map((r) => r.level));
    if (summary.dominant?.level !== event.targetLevel) return null;
  }

  return event;
}

export async function getCoinMultiplier(userId?: string) {
  const event = await getActiveFlashEvent(userId);
  return event?.coinMultiplier ?? 1;
}

export function applyCoinMultiplier(baseCoins: number, multiplier: number) {
  return Math.floor(baseCoins * multiplier);
}

export async function createFlashEvent(opts: {
  title: string;
  message: string;
  durationMinutes?: number;
  coinMultiplier?: number;
  targetLevel?: DogReputationLevel | null;
}) {
  const endsAt = new Date();
  endsAt.setMinutes(endsAt.getMinutes() + (opts.durationMinutes ?? 15));

  return prisma.flashEvent.create({
    data: {
      title: opts.title,
      message: opts.message,
      coinMultiplier: opts.coinMultiplier ?? 2,
      targetLevel: opts.targetLevel ?? null,
      endsAt,
    },
  });
}
