import { cacheGetJson, cacheSetJson } from "./redis";
import { prisma } from "./prisma";
import { VISIBLE_AUTHOR_WHERE, VISIBLE_POST_WHERE } from "./visible-posts";

const HASHTAG = /#([\p{L}\p{N}_]{2,40})/gu;
const WORD = /\b([\p{L}]{4,24})\b/gu;

const STOP = new Set([
  "para",
  "como",
  "mais",
  "muito",
  "isso",
  "essa",
  "esse",
  "aqui",
  "onde",
  "quando",
  "porque",
  "sobre",
  "você",
  "voce",
  "eles",
  "elas",
  "nossa",
  "nosso",
  "caramelo",
  "brasil",
  "matilha",
]);

export async function refreshMatilhaTrends(): Promise<number> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: since },
      communityLevel: null,
      ...VISIBLE_POST_WHERE,
      author: VISIBLE_AUTHOR_WHERE,
    },
    select: { content: true },
    take: 2000,
    orderBy: { createdAt: "desc" },
  });

  const counts = new Map<string, number>();

  for (const { content } of posts) {
    const tags = content.matchAll(HASHTAG);
    for (const m of tags) {
      const tag = m[1].toLowerCase();
      counts.set(tag, (counts.get(tag) ?? 0) + 3);
    }
    const words = content.toLowerCase().matchAll(WORD);
    for (const m of words) {
      const w = m[1];
      if (STOP.has(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24);

  await prisma.$transaction([
    prisma.matilhaTrend.deleteMany(),
    ...top.map(([tag, count]) =>
      prisma.matilhaTrend.upsert({
        where: { tag },
        create: { tag, count },
        update: { count },
      }),
    ),
  ]);

  const { cacheDelPattern } = await import("./redis");
  await cacheDelPattern("trends:v1:");
  return top.length;
}

export async function getMatilhaTrends(limit = 16) {
  const key = `trends:v1:${limit}`;
  const cached = await cacheGetJson<{ tag: string; count: number }[]>(key);
  if (cached) return cached;

  const rows = await prisma.matilhaTrend.findMany({
    orderBy: { count: "desc" },
    take: limit,
  });
  await cacheSetJson(key, rows, 300);
  return rows;
}
