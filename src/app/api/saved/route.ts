import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VISIBLE_POST_WHERE } from "@/lib/visible-posts";
import { z } from "zod";

const saveSchema = z.object({ postId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const saved = await prisma.savedPost.findMany({
    where: {
      userId: user.id,
      post: VISIBLE_POST_WHERE,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: user.id }, select: { id: true } },
        },
      },
    },
  });

  return NextResponse.json({
    posts: saved.map((s) => ({
      ...s.post,
      createdAt: s.post.createdAt.toISOString(),
      likedByMe: s.post.likes.length > 0,
      savedAt: s.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { postId } = saveSchema.parse(await request.json());
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    }

    const existing = await prisma.savedPost.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.savedPost.create({ data: { postId, userId: user.id } });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
