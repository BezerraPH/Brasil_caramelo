"use client";

import { useCallback, useState } from "react";
import { FeedPost } from "@/components/FeedPost";
import { PageContainer } from "@/components/PageContainer";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type SavedPost = Parameters<typeof FeedPost>[0]["post"];

export default function SalvosPage() {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [savedRes, meRes] = await Promise.all([
      fetch("/api/saved"),
      fetch("/api/users/me"),
    ]);
    const savedData = await savedRes.json();
    const meData = await meRes.json();
    if (savedRes.ok) setPosts(savedData.posts);
    if (meRes.ok) setUserId(meData.user?.id ?? null);
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  return (
    <PageContainer narrow>
      <header className="bc-animate-in mb-6 text-center">
        <h1 className="text-2xl font-bold text-bc-blue">Recados salvos</h1>
        <p className="text-sm text-bc-brown">
          Seus favoritos da matilha
        </p>
      </header>

      {loading ? (
        <div className="bc-skeleton h-32 rounded-2xl" />
      ) : posts.length === 0 ? (
        <p className="bc-card p-10 text-center text-bc-brown">
          Nada salvo ainda. Use 🔖 Salvar nos recados do feed.
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <FeedPost
              key={post.id}
              post={post}
              currentUserId={userId ?? undefined}
              savedByMe
              animationDelay={i < 5 ? `bc-stagger-${i + 1}` : undefined}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
