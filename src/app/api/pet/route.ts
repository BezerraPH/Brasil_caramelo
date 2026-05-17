import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { applyCare, applyPetDecay, petMood } from "@/lib/pet";
import { prisma } from "@/lib/prisma";
import { petCareSchema, petUpdateSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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
      },
    });
  }

  return NextResponse.json({
    pet: stats,
    mood: petMood(stats),
  });
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

      const updated = applyCare(applyPetDecay(pet), action);
      const saved = await prisma.pet.update({
        where: { id: pet.id },
        data: {
          hunger: updated.hunger,
          happiness: updated.happiness,
          energy: updated.energy,
          lastCareAt: updated.lastCareAt,
        },
      });

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
