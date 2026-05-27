"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { MatilhaEventsPanel } from "@/components/MatilhaEventsPanel";
import { UserAvatar } from "@/components/UserAvatar";

type ThreadRow = {
  id: string;
  title: string;
  createdAt: string;
  replyCount: number;
  pinned?: boolean;
  isGolden?: boolean;
  anonymous?: boolean;
  author: { name: string; username: string; avatarUrl: string | null };
};

type PackDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  joined: boolean;
  isOwner: boolean;
  owner: { name: string; username: string };
  goldenThreads: ThreadRow[];
  activeThreads: ThreadRow[];
  archivedThreads: ThreadRow[];
};

type MatilhaPackViewProps = {
  slug: string;
};

function ThreadTable({ threads, showAuthor = true }: { threads: ThreadRow[]; showAuthor?: boolean }) {
  if (threads.length === 0) return null;
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-bc-blue/15 text-xs text-bc-brown">
          <th className="pb-2 font-semibold">Tópico</th>
          {showAuthor && <th className="hidden pb-2 font-semibold sm:table-cell">Autor</th>}
          <th className="pb-2 text-right font-semibold">Respostas</th>
        </tr>
      </thead>
      <tbody>
        {threads.map((t) => (
          <tr key={t.id} className="border-b border-bc-blue/5">
            <td className="py-3 pr-2">
              <Link
                href={`/matilhas/topico/${t.id}`}
                className="font-medium text-bc-blue hover:underline"
              >
                {t.isGolden && "⭐ "}
                {t.pinned && "📌 "}
                {t.title}
              </Link>
              {showAuthor && (
                <p className="mt-0.5 text-[10px] text-bc-brown/70 sm:hidden">
                  {t.author.name}
                </p>
              )}
            </td>
            {showAuthor && (
              <td className="hidden py-3 sm:table-cell">
                <div className="flex items-center gap-2">
                  {!t.anonymous && (
                    <UserAvatar
                      name={t.author.name}
                      avatarUrl={t.author.avatarUrl}
                      size="sm"
                    />
                  )}
                  <span className="text-bc-brown">{t.author.name}</span>
                </div>
              </td>
            )}
            <td className="py-3 text-right text-bc-brown">{t.replyCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MatilhaPackView({ slug }: MatilhaPackViewProps) {
  const router = useRouter();
  const [pack, setPack] = useState<PackDetail | null>(null);
  const [tab, setTab] = useState<"forum" | "events">("forum");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
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
      body: JSON.stringify({ title, content, anonymous }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/matilhas/topico/${data.threadId}`);
      return;
    }
    alert(data.error ?? "Erro ao criar tópico.");
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
        <div className="mb-4 flex gap-2 border-b border-bc-blue/10 pb-2">
          <button
            type="button"
            onClick={() => setTab("forum")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === "forum" ? "bg-bc-blue/10 text-bc-blue" : "text-bc-brown"
            }`}
          >
            Fórum
          </button>
          <button
            type="button"
            onClick={() => setTab("events")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === "events" ? "bg-bc-green/10 text-bc-green" : "text-bc-brown"
            }`}
          >
            Encontros da Matilha
          </button>
        </div>

        {!pack.joined ? (
          <button
            type="button"
            disabled={joining}
            onClick={join}
            className="bc-btn-primary mb-4"
          >
            {joining ? "Entrando…" : "Entrar na Matilha"}
          </button>
        ) : tab === "forum" ? (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="bc-btn-secondary mb-4 text-sm"
          >
            {showForm ? "Cancelar" : "+ Novo tópico"}
          </button>
        ) : null}

        {tab === "events" ? (
          <MatilhaEventsPanel slug={slug} joined={pack.joined} />
        ) : (
          <>
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
                  placeholder="Primeira mensagem…"
                  className="bc-input resize-none text-sm"
                />
                <label className="flex items-center gap-2 text-xs text-bc-brown">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                  />
                  Fofoca de corredor — postar como &ldquo;Um Caramelo Misterioso&rdquo; (1×/semana)
                </label>
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

            {pack.goldenThreads.length > 0 && (
              <section className="mb-6">
                <h2 className="mb-2 text-sm font-bold text-bc-gold">
                  🏆 Calçada da Fama — Tópicos de Ouro
                </h2>
                <div className="rounded-xl border-2 border-bc-gold/40 bg-bc-gold/5 p-3">
                  <ThreadTable threads={pack.goldenThreads} />
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-2 text-sm font-bold text-bc-blue">Tópicos</h2>
              <ThreadTable threads={pack.activeThreads} />
              {pack.activeThreads.length === 0 && pack.goldenThreads.length === 0 && (
                <p className="py-6 text-center text-sm text-bc-brown">
                  Nenhum tópico ainda. Seja o primeiro!
                </p>
              )}
            </section>

            {pack.archivedThreads.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-2 text-sm font-bold text-bc-brown">
                  🔒 Arquivos Confidenciais
                </h2>
                <p className="mb-2 text-xs text-bc-brown/80">
                  História preservada — somente leitura.
                </p>
                <div className="rounded-xl border border-bc-brown/20 bg-bc-brown/5 p-3 opacity-90">
                  <ThreadTable threads={pack.archivedThreads} />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
