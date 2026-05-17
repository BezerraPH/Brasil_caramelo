"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FeedPost } from "@/components/FeedPost";
import { PageContainer } from "@/components/PageContainer";
import { UserAvatar } from "@/components/UserAvatar";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type User = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
};

type PostResult = {
  id: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  likedByMe: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
};

function BuscarContent() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "posts" ? "posts" : "people";
  const initialQ = searchParams.get("q") ?? searchParams.get("tag") ?? "";
  const initialTag = searchParams.get("tag");

  const [tab, setTab] = useState<"people" | "posts">(initialTab);
  const [q, setQ] = useState(
    initialTag ? `#${initialTag}` : initialQ,
  );
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useAsyncEffect(async () => {
    const res = await fetch("/api/users/me");
    if (res.ok) {
      const data = await res.json();
      setCurrentUserId(data.user?.id);
    }
  }, []);

  useEffect(() => {
    if (initialTag || initialQ.length >= 2) {
      void runSearch(initialTag ? `#${initialTag}` : initialQ, initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(query: string, searchTab: "people" | "posts") {
    const trimmed = query.trim();
    if (trimmed.length < 2 && !trimmed.startsWith("#")) return;
    setLoading(true);
    setSearched(true);

    if (searchTab === "people" && !trimmed.startsWith("#")) {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();
      setUsers(data.users ?? []);
      setPosts([]);
    } else {
      const tag = trimmed.startsWith("#") ? trimmed.slice(1) : null;
      const url = tag
        ? `/api/posts/search?tag=${encodeURIComponent(tag)}`
        : `/api/posts/search?q=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.posts ?? []);
      setUsers([]);
    }
    setLoading(false);
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(q, tab);
  }

  return (
    <PageContainer narrow>
      <header className="bc-animate-in mb-6">
        <h1 className="text-2xl font-bold text-bc-blue">Buscar</h1>
        <p className="text-sm text-bc-brown">
          Pessoas, recados e hashtags (#caramelo)
        </p>
      </header>

      <div className="bc-animate-in bc-stagger-1 mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("people")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            tab === "people"
              ? "bg-bc-green text-white shadow-sm"
              : "bg-bc-white text-bc-brown border border-bc-blue/15"
          }`}
        >
          Pessoas
        </button>
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            tab === "posts"
              ? "bg-bc-green text-white shadow-sm"
              : "bg-bc-white text-bc-brown border border-bc-blue/15"
          }`}
        >
          Recados
        </button>
      </div>

      <form onSubmit={search} className="bc-card bc-animate-in bc-stagger-2 mb-6 p-4">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              tab === "posts"
                ? "Texto ou #hashtag"
                : "Nome ou @usuário"
            }
            className="bc-input flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="bc-btn-primary shrink-0"
          >
            {loading ? "…" : "Buscar"}
          </button>
        </div>
      </form>

      {tab === "people" && (
        <ul className="space-y-3">
          {searched && users.length === 0 && !loading && (
            <li className="bc-card p-6 text-center text-bc-brown">
              Ninguém encontrado.
            </li>
          )}
          {users.map((u, i) => (
            <li
              key={u.id}
              className={`bc-card bc-card-interactive bc-animate-in p-4 ${i < 5 ? `bc-stagger-${i + 1}` : ""}`}
            >
              <Link href={`/perfil/${u.username}`} className="flex gap-3">
                <UserAvatar name={u.name} avatarUrl={u.avatarUrl} size="md" />
                <div>
                  <p className="font-semibold text-bc-blue">{u.name}</p>
                  <p className="text-sm text-bc-brown">@{u.username}</p>
                  {u.bio && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {u.bio}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {tab === "posts" && (
        <div className="space-y-4">
          {searched && posts.length === 0 && !loading && (
            <p className="bc-card p-6 text-center text-bc-brown">
              Nenhum recado encontrado.
            </p>
          )}
          {posts.map((post, i) => (
            <FeedPost
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              animationDelay={i < 5 ? `bc-stagger-${i + 1}` : undefined}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <PageContainer narrow>
          <div className="bc-skeleton h-10 w-40 rounded-xl" />
        </PageContainer>
      }
    >
      <BuscarContent />
    </Suspense>
  );
}
