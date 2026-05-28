import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { moderateTextFull } from "@/lib/content-moderation";
import { getCommunityBySlug } from "@/lib/communities";
import { prisma } from "@/lib/prisma";
import { communityPostSchema } from "@/lib/validators";

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

  const posts = await prisma.post.findMany({
    where: { communityId: community.id, tribunalHidden: false },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: {
        select: { name: true, username: true, avatarUrl: true, isPremium: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt.toISOString(),
      author: p.author,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
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
      { error: "Participe da comunidade para postar no mural." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { content } = communityPostSchema.parse(body);
    const text = content.trim();

    const mod = await moderateTextFull(text);
    if (!mod.ok) {
      return NextResponse.json({ error: mod.reason }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content: text,
        communityId: community.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, postId: post.id });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Recado inválido." }, { status: 400 });
  }
}
