import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { areFriends, countMutualTreats } from "@/lib/friendship";
import { createNotification } from "@/lib/notifications";
import { applyPetDecay, applyTreat, petMood } from "@/lib/pet";
import { prisma } from "@/lib/prisma";
import { petTreatSchema } from "@/lib/validators";

const TREATS_PER_DAY = 10;
const CLOSE_FRIENDS_TREATS = 5;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { toUserId } = petTreatSchema.parse(await request.json());

    if (toUserId === user.id) {
      return NextResponse.json(
        { error: "Você não pode dar petisco ao seu próprio cachorro aqui." },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, username: true, name: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (!(await areFriends(user.id, toUserId))) {
      return NextResponse.json(
        { error: "Só amigos podem visitar o quintal e dar petiscos." },
        { status: 403 },
      );
    }

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const todayCount = await prisma.petTreat.count({
      where: {
        fromUserId: user.id,
        toUserId,
        createdAt: { gte: since },
      },
    });
    if (todayCount >= TREATS_PER_DAY) {
      return NextResponse.json(
        { error: "Limite de petiscos de hoje para este cachorro." },
        { status: 429 },
      );
    }

    let pet = await prisma.pet.findUnique({ where: { userId: toUserId } });
    if (!pet) {
      pet = await prisma.pet.create({ data: { userId: toUserId } });
    }

    const updated = applyTreat(applyPetDecay(pet));
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

    await prisma.petTreat.create({
      data: { fromUserId: user.id, toUserId },
    });

    const totalTreats = await countMutualTreats(user.id, toUserId);
    const closeFriends = totalTreats >= CLOSE_FRIENDS_TREATS;

    await createNotification(
      toUserId,
      "PET_TREAT",
      `${user.name} deu um petisco para ${saved.name}! 🦴`,
      `/perfil/${user.username}`,
    );

    return NextResponse.json({
      pet: saved,
      mood: petMood(saved),
      closeFriends,
      treatsTogether: totalTreats,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao dar petisco." }, { status: 500 });
  }
}
