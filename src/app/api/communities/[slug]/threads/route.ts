import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { getCommunityBySlug } from "@/lib/communities";
import { prisma } from "@/lib/prisma";
import { communityThreadSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) {
    return NextResponse.json({ error: "Comunidade não encontrada." }, { status: 404 });
  }

  const threads = await prisma.communityThread.findMany({
    where: { communityId: community.id, archived: false },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      author: { select: { name: true, username: true, avatarUrl: true } },
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      pinned: t.pinned,
      createdAt: t.createdAt.toISOString(),
      replyCount: t._count.replies,
      author: t.author,
    })),
    isMember: community.isMember,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) {
    return NextResponse.json({ error: "Comunidade não encontrada." }, { status: 404 });
  }
  if (!community.isMember) {
    return NextResponse.json(
      { error: "Participe da comunidade para criar tópicos." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { title, content } = communityThreadSchema.parse(body);

    const thread = await prisma.communityThread.create({
      data: {
        communityId: community.id,
        title: title.trim(),
        authorId: user.id,
        replies: {
          create: {
            authorId: user.id,
            content: content.trim(),
          },
        },
      },
    });

    return NextResponse.json({ ok: true, threadId: thread.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Tópico inválido." }, { status: 400 });
  }
}
