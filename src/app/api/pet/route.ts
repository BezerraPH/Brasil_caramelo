import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { PREMIUM_PERKS } from "@/lib/constants";
import { applyCoinMultiplier, getCoinMultiplier } from "@/lib/events";
import { applyCare, applyPetDecay, petMood } from "@/lib/pet";
import { cacheDel, cacheGetJson, cacheSetJson } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { petCareSchema, petUpdateSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const cacheKey = `pet:hot:${user.id}`;
  const cached = await cacheGetJson<{
    pet: unknown;
    mood: string;
  }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) {
    pet = await prisma.pet.create({ data: { userId: user.id } });
  }

  const stats = applyPetDecay(pet);
  if (
    stats.hunger !== pet.hunger ||
    stats.happiness !== pet.happiness ||
    stats.energy !== pet.energy
  ) {
    await prisma.pet.update({
      where: { id: pet.id },
      data: {
        hunger: stats.hunger,
        happiness: stats.happiness,
        energy: stats.energy,
        level: stats.level,
        experience: stats.experience,
        coins: stats.coins,
      },
    });
  }

  const payload = {
    pet: stats,
    mood: petMood(stats),
    cached: false,
  };
  await cacheSetJson(cacheKey, payload, 45);
  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.action) {
      const { action } = petCareSchema.parse(body);
      let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
      if (!pet) {
        pet = await prisma.pet.create({ data: { userId: user.id } });
      }

      const decayed = applyPetDecay(pet);
      const coinsBefore = decayed.coins;
      let updated = applyCare(decayed, action);
      const gain = updated.coins - coinsBefore;
      if (gain > 0) {
        const mult = await getCoinMultiplier(user.id);
        const prem = user.isPremium ? PREMIUM_PERKS.coinBonus : 1;
        updated = {
          ...updated,
          coins: coinsBefore + applyCoinMultiplier(gain, mult * prem),
        };
      }
      const saved = await prisma.pet.update({
        where: { id: pet.id },
        data: {
          hunger: updated.hunger,
          happiness: updated.happiness,
          energy: updated.energy,
          level: updated.level,
          experience: updated.experience,
          coins: updated.coins,
          lastCareAt: updated.lastCareAt,
        },
      });

      await cacheDel(`pet:hot:${user.id}`);
      return NextResponse.json({
        pet: saved,
        mood: petMood(saved),
      });
    }

    const data = petUpdateSchema.parse(body);
    const pet = await prisma.pet.update({
      where: { userId: user.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.color ? { color: data.color } : {}),
      },
    });

    await cacheDel(`pet:hot:${user.id}`);
    return NextResponse.json({ pet, mood: petMood(applyPetDecay(pet)) });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
