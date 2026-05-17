import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      likedByMe: p.likes.length > 0,
      likes: undefined,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = postSchema.parse(body);

    const post = await prisma.post.create({
      data: { content, authorId: user.id },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ post: { ...post, likedByMe: false } });
  } catch {
    return NextResponse.json({ error: "Recado inválido." }, { status: 400 });
  }
}
