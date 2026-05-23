import { NextResponse } from "next/server";
import { z } from "zod";
import { unlockAchievement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friendship";
import {
  computeOffspringDna,
  getUserDominantLevel,
} from "@/lib/pet-dna";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [incoming, outgoing, offspring] = await Promise.all([
    prisma.petBreedingRequest.findMany({
      where: { toUserId: user.id, status: "PENDING" },
      include: {
        fromUser: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.petBreedingRequest.findMany({
      where: { fromUserId: user.id, status: "PENDING" },
      include: {
        toUser: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.petOffspring.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ incoming, outgoing, offspring });
}

const postSchema = z.object({
  friendUserId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { friendUserId } = postSchema.parse(await request.json());
    if (friendUserId === user.id) {
      return NextResponse.json(
        { error: "Não dá pra cruzar consigo mesmo." },
        { status: 400 },
      );
    }

    const friends = await areFriends(user.id, friendUserId);
    if (!friends) {
      return NextResponse.json(
        { error: "Só amigos podem cruzar pets." },
        { status: 403 },
      );
    }

    const pending = await prisma.petBreedingRequest.findFirst({
      where: {
        status: "PENDING",
        OR: [
          { fromUserId: user.id, toUserId: friendUserId },
          { fromUserId: friendUserId, toUserId: user.id },
        ],
      },
    });
    if (pending) {
      return NextResponse.json(
        { error: "Já existe um pedido de cruzamento pendente." },
        { status: 400 },
      );
    }

    const req = await prisma.petBreedingRequest.create({
      data: { fromUserId: user.id, toUserId: friendUserId },
    });

    return NextResponse.json({ request: req });
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
}

const patchSchema = z.object({
  requestId: z.string(),
  accept: z.boolean(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { requestId, accept } = patchSchema.parse(await request.json());
    const breeding = await prisma.petBreedingRequest.findUnique({
      where: { id: requestId },
    });

    if (!breeding || breeding.toUserId !== user.id) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    if (breeding.status !== "PENDING") {
      return NextResponse.json({ error: "Pedido já respondido." }, { status: 400 });
    }

    if (!accept) {
      await prisma.petBreedingRequest.update({
        where: { id: requestId },
        data: { status: "DECLINED" },
      });
      return NextResponse.json({ ok: true, declined: true });
    }

    const [petA, petB, levelA, levelB] = await Promise.all([
      prisma.pet.findUnique({ where: { userId: breeding.fromUserId } }),
      prisma.pet.findUnique({ where: { userId: breeding.toUserId } }),
      getUserDominantLevel(breeding.fromUserId),
      getUserDominantLevel(breeding.toUserId),
    ]);

    if (!petA || !petB) {
      return NextResponse.json(
        { error: "Ambos precisam ter um pet ativo." },
        { status: 400 },
      );
    }

    const dnaA = computeOffspringDna(
      levelA ?? "CARAMELO",
      levelB ?? "CARAMELO",
      petA.color,
      petB.color,
    );
    const dnaB = computeOffspringDna(
      levelB ?? "CARAMELO",
      levelA ?? "CARAMELO",
      petB.color,
      petA.color,
    );

    const [, offspringFrom, offspringTo] = await prisma.$transaction([
      prisma.petBreedingRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
      prisma.petOffspring.create({
        data: {
          ownerId: breeding.fromUserId,
          parentAUserId: breeding.fromUserId,
          parentBUserId: breeding.toUserId,
          dnaLevel: dnaA.dnaLevel,
          color: dnaA.color,
          name: dnaA.name,
        },
      }),
      prisma.petOffspring.create({
        data: {
          ownerId: breeding.toUserId,
          parentAUserId: breeding.fromUserId,
          parentBUserId: breeding.toUserId,
          dnaLevel: dnaB.dnaLevel,
          color: dnaB.color,
          name: dnaB.name,
        },
      }),
    ]);

    const newAchievements: string[] = [];
    for (const ownerId of [breeding.fromUserId, breeding.toUserId]) {
      const count = await prisma.petOffspring.count({ where: { ownerId } });
      if (count >= 5 && (await unlockAchievement(ownerId, "BREEDER_5"))) {
        if (ownerId === user.id) newAchievements.push("BREEDER_5");
      }
    }

    return NextResponse.json({
      ok: true,
      offspring: [offspringFrom, offspringTo],
      newAchievements,
    });
  } catch {
    return NextResponse.json({ error: "Falha ao processar cruzamento." }, { status: 400 });
  }
}
