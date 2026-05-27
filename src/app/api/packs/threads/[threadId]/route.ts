import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { packReplySchema, threadModerationSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { threadId } = await context.params;

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      pack: { select: { slug: true, name: true, ownerId: true } },
      author: { select: { name: true, username: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { name: true, username: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }

  const displayAuthor = thread.anonymous
    ? { name: "Um Caramelo Misterioso", username: "misterioso", avatarUrl: null }
    : thread.author;

  return NextResponse.json({
    thread: {
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt.toISOString(),
      archived: thread.archived,
      anonymous: thread.anonymous,
      isOwner: thread.pack.ownerId === user.id,
      author: displayAuthor,
      pack: thread.pack,
      replies: thread.replies.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        author: r.author,
      })),
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { threadId } = await context.params;

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { packId: true, archived: true, pack: { select: { slug: true } } },
  });
  if (!thread) {
    return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }

  if (thread.archived) {
    return NextResponse.json(
      { error: "Arquivo confidencial — só leitura." },
      { status: 403 },
    );
  }

  const member = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: thread.packId, userId: user.id } },
  });
  if (!member) {
    return NextResponse.json(
      { error: "Entre na Matilha para responder." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { content } = packReplySchema.parse(body);

    const reply = await prisma.reply.create({
      data: {
        threadId,
        authorId: user.id,
        content: content.trim(),
      },
    });

    return NextResponse.json({ ok: true, id: reply.id });
  } catch {
    return NextResponse.json({ error: "Resposta inválida." }, { status: 400 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { threadId } = await context.params;

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: { pack: { select: { ownerId: true, slug: true } } },
  });
  if (!thread || thread.pack.ownerId !== user.id) {
    return NextResponse.json({ error: "Só o dono da Matilha pode moderar." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = threadModerationSchema.parse(body);

    await prisma.thread.update({
      where: { id: threadId },
      data: {
        ...(data.pinned !== undefined ? { pinned: data.pinned } : {}),
        ...(data.isGolden !== undefined ? { isGolden: data.isGolden } : {}),
        ...(data.archived !== undefined ? { archived: data.archived } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Moderação inválida." }, { status: 400 });
  }
}
