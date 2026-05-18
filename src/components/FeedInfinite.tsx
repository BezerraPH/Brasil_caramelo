"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FeedPost } from "./FeedPost";

export type FeedPostItem = {
  id: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
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
  feedFilter?: "all" | "friends";
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

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const filterQ =
        feedFilter === "friends" ? "&filter=friends" : "";
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
    return (
      <p className="bc-card bc-animate-in p-10 text-center text-bc-brown">
        Nenhum recado ainda. Seja o primeiro! 🐾
      </p>
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
