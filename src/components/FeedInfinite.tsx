"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedFilterMode } from "@/lib/feed-posts";
import { feedFilterQueryParam } from "@/lib/feed-filter-query";
import { useFeedPrefetch } from "@/hooks/use-feed-prefetch";
import { FeedPost } from "./FeedPost";

export type FeedPostItem = {
  id: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoHlsUrl?: string | null;
  boostedUntil?: string | null;
  tribunalOpen?: boolean;
  createdAt: string;
  likedByMe: boolean;
  myReaction: string | null;
  savedByMe: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    isPremium?: boolean;
    petStatus?: "happy" | "ok" | "hungry" | "starving" | null;
  };
  _count: { likes: number; comments: number };
};

type FeedInfiniteProps = {
  initialPosts: FeedPostItem[];
  initialCursor: string | null;
  currentUserId: string;
  feedFilter?: FeedFilterMode;
};

export function FeedInfinite({
  initialPosts,
  initialCursor,
  currentUserId,
  feedFilter = "all",
}: FeedInfiniteProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useFeedPrefetch(posts, 0);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const filterQ = feedFilterQueryParam(feedFilter);
      const res = await fetch(
        `/api/posts?cursor=${encodeURIComponent(cursor)}${filterQ}`,
      );
      const data = await res.json();
      if (!res.ok) return;
      setPosts((prev) => [...prev, ...(data.posts as FeedPostItem[])]);
      setCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, feedFilter]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  if (posts.length === 0) {
    const emptyCopy: Record<FeedFilterMode, { title: string; hint: string }> = {
      all: {
        title: "Nenhum recado ainda",
        hint: "Seja o primeiro a latir na matilha! 🐾",
      },
      friends: {
        title: "Matilha em silêncio",
        hint: "Adicione amigos ou aguarde recados de quem você segue.",
      },
      video: {
        title: "Nenhum vídeo no feed",
        hint: "Publique um Cinelar no modo vídeo ou troque o filtro.",
      },
    };
    const copy = emptyCopy[feedFilter];
    return (
      <div className="bc-card bc-animate-in p-10 text-center">
        <p className="text-4xl" aria-hidden>
          {feedFilter === "video" ? "🎬" : "🐾"}
        </p>
        <p className="mt-3 font-semibold text-bc-blue">{copy.title}</p>
        <p className="mt-2 text-sm text-bc-brown">{copy.hint}</p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post, i) => (
        <FeedPost
          key={post.id}
          post={{
            ...post,
            likedByMe: post.likedByMe,
          }}
          currentUserId={currentUserId}
          savedByMe={post.savedByMe}
          myReaction={post.myReaction}
          animationDelay={
            i < 6 ? `bc-stagger-${Math.min(i + 2, 5)}` : undefined
          }
        />
      ))}
      <div
        ref={sentinelRef}
        className="flex justify-center py-4"
        aria-hidden={!cursor}
      >
        {loading && (
          <span className="bc-skeleton h-8 w-32 rounded-full" />
        )}
        {!cursor && posts.length > 0 && (
          <p className="text-xs text-bc-brown">Fim dos recados 🐾</p>
        )}
      </div>
    </>
  );
}
