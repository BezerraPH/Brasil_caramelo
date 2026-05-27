import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export type CachedPackSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  owner: { name: string; username: string };
  goldenThreads: {
    id: string;
    title: string;
    createdAt: string;
    replyCount: number;
    anonymous: boolean;
    authorName: string;
  }[];
  activeThreads: {
    id: string;
    title: string;
    createdAt: string;
    replyCount: number;
    pinned: boolean;
    anonymous: boolean;
    authorName: string;
  }[];
  archivedThreads: {
    id: string;
    title: string;
    createdAt: string;
    replyCount: number;
    anonymous: boolean;
    authorName: string;
  }[];
};

async function loadPackSummary(slug: string): Promise<CachedPackSummary | null> {
  const pack = await prisma.pack.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true, username: true } },
      _count: { select: { members: true } },
      threads: {
        include: {
          author: { select: { name: true } },
          _count: { select: { replies: true } },
        },
        orderBy: [{ pinned: "desc" }, { isGolden: "desc" }, { createdAt: "desc" }],
        take: 80,
      },
    },
  });

  if (!pack) return null;

  const mapThread = (t: (typeof pack.threads)[0]) => ({
    id: t.id,
    title: t.title,
    createdAt: t.createdAt.toISOString(),
    replyCount: t._count.replies,
    pinned: t.pinned,
    anonymous: t.anonymous,
    authorName: t.anonymous ? "Um Caramelo Misterioso" : t.author.name,
  });

  const goldenThreads = pack.threads
    .filter((t) => !t.archived && (t.isGolden || t.pinned))
    .map(mapThread);
  const activeThreads = pack.threads
    .filter((t) => !t.archived && !t.isGolden && !t.pinned)
    .map(mapThread);
  const archivedThreads = pack.threads.filter((t) => t.archived).map(mapThread);

  return {
    id: pack.id,
    slug: pack.slug,
    name: pack.name,
    description: pack.description,
    memberCount: pack._count.members,
    owner: pack.owner,
    goldenThreads,
    activeThreads,
    archivedThreads,
  };
}

/** Cache de 60s — fórum não muda a cada segundo. */
export function getCachedPackSummary(slug: string) {
  return unstable_cache(
    () => loadPackSummary(slug),
    [`pack-summary-${slug}`],
    { revalidate: 60, tags: [`pack-${slug}`] },
  )();
}
