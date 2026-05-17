import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { areFriends, countMutualTreats } from "@/lib/friendship";
import { applyPetDecay, petMood } from "@/lib/pet";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { userId } = await params;
  if (userId === viewer.id) {
    return NextResponse.json({ error: "Use /api/pet para seu cachorro." }, { status: 400 });
  }

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true },
  });
  if (!owner) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const friends = await areFriends(viewer.id, userId);
  let pet = await prisma.pet.findUnique({ where: { userId } });
  if (!pet) {
    pet = await prisma.pet.create({ data: { userId } });
  }

  const stats = applyPetDecay(pet);
  const treatsTogether = await countMutualTreats(viewer.id, userId);

  return NextResponse.json({
    owner,
    pet: stats,
    mood: petMood(stats),
    canTreat: friends,
    treatsTogether,
    closeFriends: treatsTogether >= 5,
  });
}
