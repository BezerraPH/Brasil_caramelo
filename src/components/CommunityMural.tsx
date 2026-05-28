"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "@/components/UserAvatar";

type MuralPost = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  likeCount: number;
  commentCount: number;
};

type CommunityMuralProps = {
  slug: string;
  isMember: boolean;
  themePrimary: string;
};

export function CommunityMural({ slug, isMember, themePrimary }: CommunityMuralProps) {
  const [posts, setPosts] = useState<MuralPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/communities/${slug}/posts`);
    const data = await res.json();
    if (res.ok) setPosts(data.posts ?? []);
    setLoading(false);
  }, [slug]);

  useAsyncEffect(() => {
    void load();
  }, [load]);

  async function publish() {
    if (!content.trim()) return;
    setSending(true);
    const res = await fetch(`/api/communities/${slug}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setContent("");
      await load();
    }
    setSending(false);
  }

  return (
    <section className="bc-community-mural bc-card bc-animate-in-up mb-8 p-5">
      <h2 className="font-bold text-bc-blue">Mural da comunidade</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Recados só para quem está nesta comunidade
      </p>

      {isMember && (
        <div className="mt-4 space-y-2">
          <textarea
            className="bc-input min-h-[72px] w-full text-sm"
            placeholder="Escreva no mural…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
          />
          <button
            type="button"
            className="bc-btn-primary text-sm"
            style={{ backgroundColor: themePrimary }}
            disabled={sending}
            onClick={() => void publish()}
          >
            {sending ? "Publicando…" : "Publicar no mural"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-4 animate-pulse text-sm text-bc-brown">Carregando mural…</p>
      ) : posts.length === 0 ? (
        <p className="mt-4 text-sm text-bc-brown">Mural vazio — seja o primeiro!</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="bc-community-mural-item rounded-xl border border-bc-green/15 bg-bc-cream/30 p-3"
            >
              <div className="flex gap-3">
                <UserAvatar
                  name={p.author.name}
                  avatarUrl={p.author.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-bc-blue">
                    <Link
                      href={`/perfil/${p.author.username}`}
                      className="hover:underline"
                    >
                      @{p.author.username}
                    </Link>
                    {p.author.isPremium && (
                      <span className="ml-1 text-bc-gold">★</span>
                    )}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-bc-brown">
                    {p.content}
                  </p>
                  <p className="mt-1 text-[10px] text-bc-brown/70">
                    {new Date(p.createdAt).toLocaleString("pt-BR")} · {p.likeCount}{" "}
                    latidas · {p.commentCount} comentários
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
