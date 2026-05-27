import type { Prisma } from "@/generated/prisma/client";
import { getFriendIds } from "./friendship";
import { expirePostBoosts } from "./post-boost";
import { prisma } from "./prisma";
import { VISIBLE_AUTHOR_WHERE, VISIBLE_POST_WHERE, capsuleVisibleWhere } from "./visible-posts";
import { applyPetDecay, petAvatarStatus } from "./pet";
import { FEED_PAGE_SIZE, type FeedPostRow } from "./feed-posts";

const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  isPremium: true,
  shadowbanned: true,
  pet: {
    select: {
      hunger: true,
      happiness: true,
      energy: true,
      lastCareAt: true,
    },
  },
} satisfies Prisma.UserSelect;

/** Pontuação agregada para ordenação do Cinelar (FYP). */
export function computeReelScoreFromStats(stats: {
  totalWatchMs: number;
  completions: number;
  likes: number;
  comments: number;
  ageHours: number;
}): number {
  const watchPart = Math.log10(1 + stats.totalWatchMs / 1000) * 22;
  const completionPart = stats.completions * 18;
  const socialPart = stats.likes * 3 + stats.comments * 2;
  const freshness = Math.max(0, 72 - stats.ageHours) * 0.4;
  return watchPart + completionPart + socialPart + freshness;
}

export async function refreshPostReelScore(postId: string): Promise<number> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { createdAt: true, _count: { select: { likes: true, comments: true } } },
  });
  if (!post) return 0;

  const agg = await prisma.postInteraction.aggregate({
    where: { postId },
    _sum: { watchMs: true },
    _count: { _all: true },
  });
  const completions = await prisma.postInteraction.count({
    where: { postId, completed: true },
  });

  const ageHours =
    (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
  const score = computeReelScoreFromStats({
    totalWatchMs: agg._sum.watchMs ?? 0,
    completions,
    likes: post._count.likes,
    comments: post._count.comments,
    ageHours,
  });

  await prisma.post.update({
    where: { id: postId },
    data: { reelScore: score },
  });
  return score;
}

export async function recordReelView(
  userId: string,
  postId: string,
  payload: { watchMs: number; completed?: boolean; liked?: boolean; shared?: boolean },
) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      videoUrl: { not: null },
      ...VISIBLE_POST_WHERE,
    },
    select: { id: true },
  });
  if (!post) return null;

  const watchMs = Math.min(Math.max(0, Math.floor(payload.watchMs)), 600_000);
  const completed = Boolean(payload.completed);

  const existing = await prisma.postInteraction.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  await prisma.postInteraction.upsert({
    where: { postId_userId: { postId, userId } },
    create: {
      postId,
      userId,
      watchMs,
      completed,
      liked: payload.liked ?? false,
      shared: payload.shared ?? false,
    },
    update: {
      watchMs: Math.max(existing?.watchMs ?? 0, watchMs),
      completed: (existing?.completed ?? false) || completed,
      liked: (existing?.liked ?? false) || Boolean(payload.liked),
      shared: (existing?.shared ?? false) || Boolean(payload.shared),
    },
  });

  return refreshPostReelScore(postId);
}

function mapAuthor(
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
    pet: {
      hunger: number;
      happiness: number;
      energy: number;
      lastCareAt: Date;
    } | null;
  },
): FeedPostRow["author"] {
  let petStatus = null;
  if (author.pet) {
    const decayed = applyPetDecay({
      ...author.pet,
      id: "",
      name: "",
      color: "",
      level: 1,
      experience: 0,
      coins: 0,
    });
    petStatus = petAvatarStatus(decayed);
  }
  return {
    id: author.id,
    name: author.name,
    username: author.username,
    avatarUrl: author.avatarUrl,
    isPremium: author.isPremium,
    petStatus,
  };
}

function interleaveCinelar<T extends { author: { id: string } }>(
  friendPosts: T[],
  discoveryPosts: T[],
): T[] {
  const out: T[] = [];
  let fi = 0;
  let di = 0;
  while (fi < friendPosts.length || di < discoveryPosts.length) {
    for (let i = 0; i < 2 && di < discoveryPosts.length; i++) {
      out.push(discoveryPosts[di++]!);
    }
    if (fi < friendPosts.length) out.push(friendPosts[fi++]!);
  }
  return out;
}

/** Feed Cinelar — mistura descoberta (reelScore) + amigos (recentes). */
export async function fetchCinelarFeed(viewerId: string, cursor?: string | null) {
  await expirePostBoosts();
  const friendIds = await getFriendIds(viewerId);
  const poolSize = FEED_PAGE_SIZE * 4;

  const baseWhere: Prisma.PostWhereInput = {
    videoUrl: { not: null },
    communityLevel: null,
    ...VISIBLE_POST_WHERE,
    ...capsuleVisibleWhere(viewerId),
    author: VISIBLE_AUTHOR_WHERE,
  };

  const [friendRows, discoveryRows] = await Promise.all([
    friendIds.length > 0
      ? prisma.post.findMany({
          where: { ...baseWhere, authorId: { in: friendIds } },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: poolSize,
          include: {
            author: { select: authorSelect },
            tribunalCase: { select: { status: true } },
            _count: { select: { likes: true, comments: true } },
            likes: {
              where: { userId: viewerId },
              select: { id: true, reaction: true },
            },
          },
        })
      : Promise.resolve([]),
    prisma.post.findMany({
      where: {
        ...baseWhere,
        ...(friendIds.length > 0 ? { authorId: { notIn: friendIds } } : {}),
      },
      orderBy: [{ reelScore: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      take: poolSize,
      include: {
        author: { select: authorSelect },
        tribunalCase: { select: { status: true } },
        _count: { select: { likes: true, comments: true } },
        likes: {
          where: { userId: viewerId },
          select: { id: true, reaction: true },
        },
      },
    }),
  ]);

  const merged = interleaveCinelar(friendRows, discoveryRows);
  let start = 0;
  if (cursor) {
    const idx = merged.findIndex((p) => p.id === cursor);
    start = idx >= 0 ? idx + 1 : 0;
  }

  const slice = merged.slice(start, start + FEED_PAGE_SIZE + 1);
  const hasMore = slice.length > FEED_PAGE_SIZE;
  const page = hasMore ? slice.slice(0, FEED_PAGE_SIZE) : slice;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  const posts = page.map((p) => ({
    id: p.id,
    content: p.content,
    imageUrl: p.imageUrl,
    videoUrl: p.videoUrl,
    videoHlsUrl: p.videoHlsUrl,
    boostedUntil: p.boostedUntil?.toISOString() ?? null,
    tribunalOpen: p.tribunalCase?.status === "OPEN",
    createdAt: p.createdAt.toISOString(),
    author: mapAuthor(p.author),
    _count: p._count,
    likedByMe: p.likes.length > 0,
    myReaction: p.likes[0]?.reaction ?? null,
    savedByMe: false as boolean,
  }));

  return { posts, nextCursor };
}
