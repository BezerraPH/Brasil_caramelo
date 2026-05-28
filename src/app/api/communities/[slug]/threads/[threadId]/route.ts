import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { getCommunityBySlug } from "@/lib/communities";
import { prisma } from "@/lib/prisma";
import { packReplySchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ slug: string; threadId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug, threadId } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) {
    return NextResponse.json({ error: "Comunidade não encontrada." }, { status: 404 });
  }

  const thread = await prisma.communityThread.findFirst({
    where: { id: threadId, communityId: community.id },
    include: {
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

  return NextResponse.json({
    thread: {
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt.toISOString(),
      archived: thread.archived,
      pinned: thread.pinned,
      author: thread.author,
      community: { slug: community.slug, name: community.name },
      isMember: community.isMember,
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

  const { slug, threadId } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) {
    return NextResponse.json({ error: "Comunidade não encontrada." }, { status: 404 });
  }
  if (!community.isMember) {
    return NextResponse.json(
      { error: "Participe da comunidade para responder." },
      { status: 403 },
    );
  }

  const thread = await prisma.communityThread.findFirst({
    where: { id: threadId, communityId: community.id },
    select: { archived: true },
  });
  if (!thread) {
    return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }
  if (thread.archived) {
    return NextResponse.json(
      { error: "Tópico arquivado — só leitura." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { content } = packReplySchema.parse(body);

    const reply = await prisma.communityReply.create({
      data: {
        threadId,
        authorId: user.id,
        content: content.trim(),
      },
    });

    return NextResponse.json({ ok: true, replyId: reply.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Resposta inválida." }, { status: 400 });
  }
}
