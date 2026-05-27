import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: postId } = await context.params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, username: true, name: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }

  if (post.authorId === user.id) {
    return NextResponse.json(
      { error: "Você não pode dar biscoito no próprio recado." },
      { status: 400 },
    );
  }

  try {
    await prisma.postBiscuit.create({
      data: { postId, fromUserId: user.id },
    });
  } catch {
    return NextResponse.json(
      { error: "Você já deu biscoito neste recado." },
      { status: 409 },
    );
  }

  await prisma.user.update({
    where: { id: post.authorId },
    data: { biscuitBalance: { increment: 1 } },
  });

  await createNotification(
    post.authorId,
    "BISCUIT_RECEIVED",
    `${user.name} enviou um 🍪 Biscoito no seu recado!`,
    `/feed?post=${postId}`,
  );

  const count = await prisma.postBiscuit.count({ where: { postId } });

  return NextResponse.json({ ok: true, biscuitCount: count });
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: postId } = await context.params;

  const [count, mine] = await Promise.all([
    prisma.postBiscuit.count({ where: { postId } }),
    prisma.postBiscuit.findUnique({
      where: { postId_fromUserId: { postId, fromUserId: user.id } },
    }),
  ]);

  return NextResponse.json({ count, givenByMe: !!mine });
}
