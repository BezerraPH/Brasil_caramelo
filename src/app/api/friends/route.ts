import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { friendRequestSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [friends, pendingReceived, pendingSent] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
      include: {
        requester: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        addressee: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    }),
    prisma.friendship.findMany({
      where: { status: "PENDING", addresseeId: user.id },
      include: {
        requester: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    }),
    prisma.friendship.findMany({
      where: { status: "PENDING", requesterId: user.id },
      include: {
        addressee: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    }),
  ]);

  const friendUsers = friends.map((f) =>
    f.requesterId === user.id ? f.addressee : f.requester,
  );

  return NextResponse.json({
    friends: friendUsers,
    pendingReceived,
    pendingSent,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username } = friendRequestSchema.parse(body);
    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!target) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    if (target.id === user.id) {
      return NextResponse.json(
        { error: "Você não pode adicionar a si mesmo." },
        { status: 400 },
      );
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, addresseeId: target.id },
          { requesterId: target.id, addresseeId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json({ error: "Já são amigos." }, { status: 409 });
      }
      return NextResponse.json(
        { error: "Pedido de amizade já enviado." },
        { status: 409 },
      );
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        addresseeId: target.id,
        status: "PENDING",
      },
    });

    await createNotification(
      target.id,
      "FRIEND_REQUEST",
      `${user.name} quer ser seu amigo na matilha!`,
      "/amigos",
    );

    return NextResponse.json({ ok: true, id: friendship.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
}
