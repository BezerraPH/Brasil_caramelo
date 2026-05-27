"use client";

import { useCallback, useRef, useState } from "react";
import { ReelsFeed } from "@/components/ReelsFeed";

type CinelarPost = {
  id: string;
  content: string;
  videoUrl: string;
  videoHlsUrl?: string | null;
  likedByMe: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
};

type CinelarFeedProps = {
  initialPosts: CinelarPost[];
  initialCursor: string | null;
  currentUserId: string;
  viewerPet?: { name: string; color: string } | null;
};

export function CinelarFeed({
  initialPosts,
  initialCursor,
  currentUserId,
  viewerPet,
}: CinelarFeedProps) {
  const [posts, setPosts] = useState(
    initialPosts.filter((p) => p.videoUrl),
  );
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/cinelar?cursor=${encodeURIComponent(cursor)}`,
      );
      const data = await res.json();
      if (!res.ok) return;
      const next = (data.posts as CinelarPost[]).filter((p) => p.videoUrl);
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...next.filter((p) => !ids.has(p.id))];
      });
      setCursor(data.nextCursor ?? null);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor]);

  return (
    <div className="space-y-2">
      <p className="bc-cinelar-fyp-badge mx-auto max-w-lg px-2 text-center text-xs font-medium text-bc-caramel">
        ✨ For You da matilha — vídeos que a galera assistiu até o fim
      </p>
      <ReelsFeed
        posts={posts}
        currentUserId={currentUserId}
        viewerPet={viewerPet}
        onNearEnd={cursor ? loadMore : undefined}
        trackViews
      />
      {loading && (
        <p className="py-4 text-center text-xs text-bc-brown animate-pulse">
          Carregando mais Cinelar…
        </p>
      )}
    </div>
  );
}
