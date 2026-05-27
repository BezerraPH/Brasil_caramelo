import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  meiliSearchPosts,
  meiliSearchPostsByTag,
} from "@/lib/meilisearch-search";
import type { SearchEngine } from "@/lib/meilisearch";
import { prisma } from "@/lib/prisma";
import { tokenizeSearchQuery } from "@/lib/search-words";
import { VISIBLE_AUTHOR_WHERE, VISIBLE_POST_WHERE } from "@/lib/visible-posts";

const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
    },
  },
  _count: { select: { likes: true, comments: true } },
  likes: { select: { id: true } },
} as const;

async function hydratePosts(ids: string[], userId: string) {
  if (ids.length === 0) return [];
  const rows = await prisma.post.findMany({
    where: {
      id: { in: ids },
      ...VISIBLE_POST_WHERE,
      author: VISIBLE_AUTHOR_WHERE,
    },
    include: {
      ...postInclude,
      likes: { where: { userId }, select: { id: true } },
    },
  });
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows
    .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))
    .map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      likedByMe: p.likes.length > 0,
    }));
}

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

  let engine: SearchEngine = "sql";

  if (tag) {
    if (tag.length < 2) {
      return NextResponse.json({ posts: [], engine });
    }

    const meili = await meiliSearchPostsByTag(tag);
    if (meili) {
      engine = meili.engine;
      const posts = await hydratePosts(meili.ids, user.id);
      return NextResponse.json({ posts, engine });
    }

    const posts = await prisma.post.findMany({
      where: {
        content: { contains: `#${tag}`, mode: "insensitive" },
        communityLevel: null,
        ...VISIBLE_POST_WHERE,
        author: VISIBLE_AUTHOR_WHERE,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        ...postInclude,
        likes: { where: { userId: user.id }, select: { id: true } },
      },
    });
    return NextResponse.json({
      posts: posts.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        likedByMe: p.likes.length > 0,
      })),
      engine,
    });
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [], engine });
  }

  const meili = await meiliSearchPosts(q);
  if (meili) {
    engine = meili.engine;
    const posts = await hydratePosts(meili.ids, user.id);
    return NextResponse.json({ posts, engine });
  }

  const words = tokenizeSearchQuery(q);
  const textFilter =
    words.length >= 1
      ? {
          AND: words.map((word) => ({
            content: { contains: word, mode: "insensitive" as const },
          })),
        }
      : {
          OR: [
            { content: { contains: q, mode: "insensitive" as const } },
            {
              author: {
                username: { contains: q, mode: "insensitive" as const },
              },
            },
            { author: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        };

  const posts = await prisma.post.findMany({
    where: {
      communityLevel: null,
      ...VISIBLE_POST_WHERE,
      author: VISIBLE_AUTHOR_WHERE,
      ...textFilter,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      ...postInclude,
      likes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      likedByMe: p.likes.length > 0,
    })),
    engine,
  });
}
