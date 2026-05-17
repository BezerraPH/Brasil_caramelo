import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const tagRaw = params.get("tag")?.trim().replace(/^#/, "");
  const qRaw = params.get("q")?.trim();
  const tag = tagRaw || (qRaw?.startsWith("#") ? qRaw.slice(1) : null);
  const q = tag ? null : qRaw;

  if (tag) {
    if (tag.length < 2) {
      return NextResponse.json({ posts: [] });
    }
    const posts = await prisma.post.findMany({
      where: {
        content: { contains: `#${tag}`, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
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
    });
    return NextResponse.json({
      posts: posts.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        likedByMe: p.likes.length > 0,
      })),
    });
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [] });
  }

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { content: { contains: q, mode: "insensitive" } },
        { author: { username: { contains: q, mode: "insensitive" } } },
        { author: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 30,
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
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      likedByMe: p.likes.length > 0,
    })),
  });
}
