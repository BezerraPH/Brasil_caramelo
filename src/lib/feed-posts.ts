import type { Prisma } from "@/generated/prisma/client";
import { getFriendIds } from "./friendship";
import { expirePostBoosts } from "./post-boost";
import { prisma } from "./prisma";
import { applyPetDecay, petAvatarStatus, type PetAvatarStatus } from "./pet";

export const FEED_PAGE_SIZE = 12;

export type FeedFilterMode = "all" | "friends" | "video";

export function parseFeedFilter(filter?: string | null): FeedFilterMode {
  if (filter === "friends") return "friends";
  if (filter === "video") return "video";
  return "all";
}

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

export type FeedPostRow = {
  id: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
    petStatus: PetAvatarStatus | null;
  };
  _count: { likes: number; comments: number };
  likes: { id: string; reaction: string }[];
};

function mapAuthorPet(
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
  let petStatus: PetAvatarStatus | null = null;
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

export async function fetchFeedPage(
  viewerId: string,
  cursor?: string | null,
  options?: {
    includeShadowbanned?: boolean;
    friendsOnly?: boolean;
    videosOnly?: boolean;
  },
) {
  const take = FEED_PAGE_SIZE + 1;
  await expirePostBoosts();

  let authorFilter: Prisma.PostWhereInput["author"] = options?.includeShadowbanned
    ? undefined
    : { shadowbanned: false };

  if (options?.friendsOnly) {
    const friendIds = await getFriendIds(viewerId);
    authorFilter = {
      ...(typeof authorFilter === "object" ? authorFilter : {}),
      id: { in: friendIds },
    };
  }

  const rows = await prisma.post.findMany({
    where: {
      communityLevel: null,
      tribunalHidden: false,
      ...(authorFilter ? { author: authorFilter } : {}),
      ...(options?.videosOnly ? { videoUrl: { not: null } } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: authorSelect },
      _count: { select: { likes: true, comments: true } },
      likes: {
        where: { userId: viewerId },
        select: { id: true, reaction: true },
      },
    },
  });

  const hasMore = rows.length > FEED_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  const posts = page.map((p) => ({
    id: p.id,
    content: p.content,
    imageUrl: p.imageUrl,
    videoUrl: p.videoUrl,
    videoHlsUrl: p.videoHlsUrl,
    boostedUntil: p.boostedUntil?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    author: mapAuthorPet(p.author),
    _count: p._count,
    likedByMe: p.likes.length > 0,
    myReaction: p.likes[0]?.reaction ?? null,
    savedByMe: false as boolean,
  }));

  return { posts, nextCursor };
}

export async function attachSavedFlags<T extends { id: string }>(
  viewerId: string,
  posts: T[],
): Promise<(T & { savedByMe: boolean })[]> {
  if (posts.length === 0) return posts.map((p) => ({ ...p, savedByMe: false }));
  const saved = await prisma.savedPost.findMany({
    where: {
      userId: viewerId,
      postId: { in: posts.map((p) => p.id) },
    },
    select: { postId: true },
  });
  const set = new Set(saved.map((s) => s.postId));
  return posts.map((p) => ({ ...p, savedByMe: set.has(p.id) }));
}
