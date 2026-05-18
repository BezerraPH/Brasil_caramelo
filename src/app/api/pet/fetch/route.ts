import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { applyPetDecay } from "@/lib/pet";
import {
  canPetFetch,
  rollPetFetchReward,
  type FetchReward,
} from "@/lib/pet-fetch";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) pet = await prisma.pet.create({ data: { userId: user.id } });

  return NextResponse.json({
    canFetch: canPetFetch(pet.lastFetchAt),
    lastFetchAt: pet.lastFetchAt?.toISOString() ?? null,
  });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) pet = await prisma.pet.create({ data: { userId: user.id } });

  if (!canPetFetch(pet.lastFetchAt)) {
    return NextResponse.json(
      { error: "O pet já foi buscar hoje. Volte amanhã!" },
      { status: 400 },
    );
  }

  const decayed = applyPetDecay(pet);
  const reward: FetchReward = await rollPetFetchReward(user.id);
  const now = new Date();

  let update: {
    lastFetchAt: Date;
    coins?: number;
    experience?: number;
  } = { lastFetchAt: now };

  if (reward.type === "coins") {
    update = { ...update, coins: decayed.coins + reward.coins };
  } else if (reward.type === "xp") {
    update = { ...update, experience: decayed.experience + reward.xp };
  }

  const updated = await prisma.pet.update({
    where: { id: pet.id },
    data: update,
  });

  return NextResponse.json({
    reward,
    pet: applyPetDecay({
      ...updated,
      id: updated.id,
      name: updated.name,
      color: updated.color,
      hunger: updated.hunger,
      happiness: updated.happiness,
      energy: updated.energy,
      level: updated.level,
      experience: updated.experience,
      coins: updated.coins,
      lastCareAt: updated.lastCareAt,
    }),
  });
}
