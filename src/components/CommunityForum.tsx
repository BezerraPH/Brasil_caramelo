"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "@/components/UserAvatar";

type ThreadRow = {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  replyCount: number;
  author: { name: string; username: string; avatarUrl: string | null };
};

type CommunityForumProps = {
  slug: string;
  isMember: boolean;
  canModerate: boolean;
  themePrimary: string;
};

export function CommunityForum({
  slug,
  isMember,
  canModerate,
  themePrimary,
}: CommunityForumProps) {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/communities/${slug}/threads`);
    const data = await res.json();
    if (res.ok) setThreads(data.threads ?? []);
    setLoading(false);
  }, [slug]);

  useAsyncEffect(load, [load]);

  async function createThread() {
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    const res = await fetch(`/api/communities/${slug}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      const data = await res.json();
      setTitle("");
      setContent("");
      setOpenNew(false);
      setSelectedId(data.threadId);
      await load();
    }
    setSending(false);
  }

  if (selectedId) {
    return (
      <CommunityThreadView
        slug={slug}
        threadId={selectedId}
        canModerate={canModerate}
        themePrimary={themePrimary}
        onBack={() => {
          setSelectedId(null);
          void load();
        }}
      />
    );
  }

  return (
    <section className="bc-card mt-8 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-bc-blue">Fórum da comunidade</h2>
        {isMember && (
          <button
            type="button"
            className="bc-btn-primary text-sm"
            style={{ backgroundColor: themePrimary }}
            onClick={() => setOpenNew((v) => !v)}
          >
            {openNew ? "Cancelar" : "Novo tópico"}
          </button>
        )}
      </div>

      {!isMember && (
        <p className="mt-2 text-xs text-bc-brown">
          Participe da comunidade para criar tópicos e responder.
        </p>
      )}

      {openNew && isMember && (
        <div className="mt-4 space-y-3 rounded-xl border border-bc-green/20 bg-bc-cream/40 p-4">
          <input
            type="text"
            className="bc-input w-full"
            placeholder="Título do tópico"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <textarea
            className="bc-input min-h-[100px] w-full"
            placeholder="Primeira mensagem…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={4000}
          />
          <button
            type="button"
            className="bc-btn-primary"
            disabled={sending}
            onClick={() => void createThread()}
          >
            {sending ? "Publicando…" : "Publicar tópico"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-4 animate-pulse text-sm text-bc-brown">Carregando fórum…</p>
      ) : threads.length === 0 ? (
        <p className="mt-4 text-sm text-bc-brown">
          Nenhum tópico ainda. Seja o primeiro a abrir um debate!
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="bc-card-interactive flex w-full items-start gap-3 rounded-xl border border-bc-green/15 p-3 text-left"
                onClick={() => setSelectedId(t.id)}
              >
                <UserAvatar
                  name={t.author.name}
                  avatarUrl={t.author.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-bc-blue">
                    {t.pinned && (
                      <span className="mr-1 text-xs" style={{ color: themePrimary }}>
                        📌
                      </span>
                    )}
                    {t.title}
                  </p>
                  <p className="text-xs text-bc-brown">
                    @{t.author.username} · {t.replyCount} resposta
                    {t.replyCount === 1 ? "" : "s"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type ThreadDetailProps = {
  slug: string;
  threadId: string;
  canModerate: boolean;
  themePrimary: string;
  onBack: () => void;
};

function CommunityThreadView({
  slug,
  threadId,
  canModerate,
  themePrimary,
  onBack,
}: ThreadDetailProps) {
  const [thread, setThread] = useState<{
    id: string;
    title: string;
    author: { name: string; username: string; avatarUrl: string | null };
    isMember: boolean;
    archived: boolean;
    replies: {
      id: string;
      content: string;
      createdAt: string;
      author: { name: string; username: string; avatarUrl: string | null };
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [modBusy, setModBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/communities/${slug}/threads/${threadId}`);
    const data = await res.json();
    if (res.ok) setThread(data.thread);
    setLoading(false);
  }, [slug, threadId]);

  useAsyncEffect(load, [load]);

  async function reply() {
    if (!content.trim() || !thread?.isMember) return;
    setSending(true);
    const res = await fetch(`/api/communities/${slug}/threads/${threadId}`, {
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

  async function moderate(data: { pinned?: boolean; archived?: boolean }) {
    setModBusy(true);
    await fetch(`/api/communities/${slug}/threads/${threadId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
    setModBusy(false);
  }

  if (loading) {
    return (
      <section className="bc-card mt-8 p-5">
        <p className="animate-pulse text-sm text-bc-brown">Lendo tópico…</p>
      </section>
    );
  }

  if (!thread) {
    return (
      <section className="bc-card mt-8 p-5">
        <p className="text-sm text-bc-brown">Tópico não encontrado.</p>
        <button type="button" className="bc-btn-secondary mt-3" onClick={onBack}>
          ← Voltar ao fórum
        </button>
      </section>
    );
  }

  return (
    <section className="bc-card mt-8 p-5">
      <button type="button" className="text-sm text-bc-blue hover:underline" onClick={onBack}>
        ← Voltar ao fórum
      </button>
      <h2 className="mt-3 text-xl font-bold" style={{ color: themePrimary }}>
        {thread.title}
      </h2>
      <p className="mt-1 text-xs text-bc-brown">
        por{" "}
        <Link href={`/perfil/${thread.author.username}`} className="text-bc-blue hover:underline">
          @{thread.author.username}
        </Link>
      </p>

      {canModerate && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="bc-btn-secondary text-xs"
            disabled={modBusy}
            onClick={() => void moderate({ pinned: true })}
          >
            Fixar
          </button>
          <button
            type="button"
            className="bc-btn-secondary text-xs"
            disabled={modBusy}
            onClick={() => void moderate({ archived: true })}
          >
            Arquivar
          </button>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {thread.replies.map((r) => (
          <li key={r.id} className="flex gap-3 border-t border-bc-green/10 pt-4">
            <UserAvatar name={r.author.name} avatarUrl={r.author.avatarUrl} size="sm" />
            <div>
              <p className="text-xs font-medium text-bc-blue">
                <Link href={`/perfil/${r.author.username}`} className="hover:underline">
                  @{r.author.username}
                </Link>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-bc-brown">{r.content}</p>
            </div>
          </li>
        ))}
      </ul>

      {thread.isMember && !thread.archived && (
        <div className="mt-6 space-y-2 border-t border-bc-green/20 pt-4">
          <textarea
            className="bc-input min-h-[80px] w-full"
            placeholder="Sua resposta…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={4000}
          />
          <button
            type="button"
            className="bc-btn-primary"
            disabled={sending}
            onClick={() => void reply()}
          >
            {sending ? "Enviando…" : "Responder"}
          </button>
        </div>
      )}
    </section>
  );
}
