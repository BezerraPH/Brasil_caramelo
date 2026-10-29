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

const CINELAR_HASHTAGS = [
  { id: "all", label: "🔥 Todos" },
  { id: "caramelo", label: "#caramelo" },
  { id: "resgate", label: "#resgate" },
  { id: "adote", label: "#adote" },
  { id: "humor", label: "#humor" },
  { id: "filhotes", label: "#filhotes" },
  { id: "matilha", label: "#matilha" },
];

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  async function handleSelectTag(tagId: string) {
    const newTag = tagId === "all" ? null : tagId;
    setSelectedTag(newTag);
    setLoading(true);
    try {
      const url = newTag
        ? `/api/posts/cinelar?tag=${encodeURIComponent(newTag)}`
        : `/api/posts/cinelar`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) return;
      const next = (data.posts as CinelarPost[]).filter((p) => p.videoUrl);
      setPosts(next);
      setCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(async () => {
    if (!cursor || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const tagParam = selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : "";
      const res = await fetch(
        `/api/posts/cinelar?cursor=${encodeURIComponent(cursor)}${tagParam}`,
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
  }, [cursor, selectedTag]);

  return (
    <div className="space-y-3">
      {/* Barra de chips de filtros por hashtag/matilha (R-DIS-01) */}
      <div className="mx-auto flex max-w-lg items-center gap-1.5 overflow-x-auto px-2 py-1 scrollbar-none">
        {CINELAR_HASHTAGS.map((tag) => {
          const isActive =
            (tag.id === "all" && selectedTag === null) ||
            selectedTag === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleSelectTag(tag.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition shadow-2xs ${
                isActive
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-bc-white/80 text-bc-brown/80 hover:bg-bc-white hover:text-bc-blue border border-bc-caramel/20 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

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
