"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "@/components/UserAvatar";

type PackDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  joined: boolean;
  owner: { name: string; username: string };
  threads: {
    id: string;
    title: string;
    createdAt: string;
    replyCount: number;
    author: { name: string; username: string; avatarUrl: string | null };
  }[];
};

type MatilhaPackViewProps = {
  slug: string;
};

export function MatilhaPackView({ slug }: MatilhaPackViewProps) {
  const router = useRouter();
  const [pack, setPack] = useState<PackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/packs/${slug}`);
    const data = await res.json();
    if (res.ok) setPack(data.pack);
    setLoading(false);
  }, [slug]);

  useAsyncEffect(load, [load]);

  async function join() {
    setJoining(true);
    await fetch(`/api/packs/${slug}`, { method: "POST" });
    await load();
    setJoining(false);
  }

  async function createThread() {
    if (!title.trim() || !content.trim()) return;
    setCreating(true);
    const res = await fetch(`/api/packs/${slug}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/matilhas/topico/${data.threadId}`);
      return;
    }
    setCreating(false);
  }

  if (loading) {
    return <p className="animate-pulse text-sm text-bc-brown">Abrindo a Matilha…</p>;
  }

  if (!pack) {
    return <p className="text-sm text-bc-brown">Matilha não encontrada.</p>;
  }

  return (
    <div>
      <div
        className="rounded-t-2xl px-5 py-6 text-white"
        style={{ background: "linear-gradient(120deg, #C68642, #2D8B57)" }}
      >
        <h1 className="text-2xl font-bold">{pack.name}</h1>
        <p className="mt-2 text-sm opacity-95">{pack.description}</p>
        <p className="mt-2 text-xs opacity-80">
          {pack.memberCount} membros · criada por {pack.owner.name}
        </p>
      </div>

      <div className="bc-card rounded-t-none border-t-0 p-4">
        {!pack.joined ? (
          <button
            type="button"
            disabled={joining}
            onClick={join}
            className="bc-btn-primary mb-4"
          >
            {joining ? "Entrando…" : "Entrar na Matilha"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="bc-btn-secondary mb-4 text-sm"
          >
            {showForm ? "Cancelar" : "+ Novo tópico"}
          </button>
        )}

        {showForm && pack.joined && (
          <div className="mb-6 space-y-3 rounded-xl border border-bc-blue/15 p-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do tópico"
              maxLength={120}
              className="bc-input text-sm"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="Primeira mensagem do tópico…"
              className="bc-input resize-none text-sm"
            />
            <button
              type="button"
              disabled={creating}
              onClick={createThread}
              className="bc-btn-primary text-sm"
            >
              {creating ? "Criando…" : "Publicar tópico"}
            </button>
          </div>
        )}

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bc-blue/15 text-xs text-bc-brown">
              <th className="pb-2 font-semibold">Tópico</th>
              <th className="hidden pb-2 font-semibold sm:table-cell">Autor</th>
              <th className="pb-2 text-right font-semibold">Respostas</th>
            </tr>
          </thead>
          <tbody>
            {pack.threads.map((t) => (
              <tr key={t.id} className="border-b border-bc-blue/5">
                <td className="py-3 pr-2">
                  <Link
                    href={`/matilhas/topico/${t.id}`}
                    className="font-medium text-bc-blue hover:underline"
                  >
                    {t.title}
                  </Link>
                  <p className="mt-0.5 text-[10px] text-bc-brown/70 sm:hidden">
                    {t.author.name}
                  </p>
                </td>
                <td className="hidden py-3 sm:table-cell">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={t.author.name}
                      avatarUrl={t.author.avatarUrl}
                      size="sm"
                    />
                    <span className="text-bc-brown">{t.author.name}</span>
                  </div>
                </td>
                <td className="py-3 text-right text-bc-brown">{t.replyCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pack.threads.length === 0 && (
          <p className="py-6 text-center text-sm text-bc-brown">
            Nenhum tópico ainda. Seja o primeiro!
          </p>
        )}
      </div>
    </div>
  );
}
