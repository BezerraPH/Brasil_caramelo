import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friendship";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  buildPetPokeMessage,
  canUseSniffPoke,
  PET_POKE_HAPPINESS_BONUS,
} from "@/lib/pet-poke";
import { summarizeReputation } from "@/lib/reputation";
import { petPokeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { toUserId, action } = petPokeSchema.parse(body);

    if (toUserId === user.id) {
      return NextResponse.json(
        { error: "Você não pode cutucar seu próprio pet." },
        { status: 400 },
      );
    }

    const friends = await areFriends(user.id, toUserId);
    if (!friends) {
      return NextResponse.json(
        { error: "Só amigos podem dar PetPoke." },
        { status: 403 },
      );
    }

    if (action === "SNIFF") {
      const reps = await prisma.reputation.findMany({
        where: { toUserId: user.id },
        select: { level: true },
      });
      const dominant = summarizeReputation(reps.map((r) => r.level)).dominant?.level;
      if (!canUseSniffPoke(dominant)) {
        return NextResponse.json(
          { error: "Só quem tem vibe Vira-Lata ou Caramelo pode usar essa ação." },
          { status: 403 },
        );
      }
    }

    const [fromPet, toPet, target] = await Promise.all([
      prisma.pet.findUnique({ where: { userId: user.id } }),
      prisma.pet.findUnique({ where: { userId: toUserId } }),
      prisma.user.findUnique({
        where: { id: toUserId },
        select: { username: true },
      }),
    ]);

    if (!fromPet || !toPet || !target) {
      return NextResponse.json(
        { error: "Pets ou usuário não encontrados." },
        { status: 404 },
      );
    }

    await prisma.petPoke.create({
      data: { fromUserId: user.id, toUserId, action },
    });

    const bonus = PET_POKE_HAPPINESS_BONUS;
    const cap = (n: number) => Math.min(100, n + bonus);

    await Promise.all([
      prisma.pet.update({
        where: { id: fromPet.id },
        data: { happiness: cap(fromPet.happiness) },
      }),
      prisma.pet.update({
        where: { id: toPet.id },
        data: { happiness: cap(toPet.happiness) },
      }),
    ]);

    const message = buildPetPokeMessage(
      fromPet.name,
      user.name,
      toPet.name,
      action,
    );

    await createNotification(
      toUserId,
      "PET_POKE",
      message,
      `/perfil/${target.username}`,
    );

    return NextResponse.json({ ok: true, message });
  } catch {
    return NextResponse.json({ error: "PetPoke inválido." }, { status: 400 });
  }
}
