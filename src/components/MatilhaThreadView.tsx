"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "@/components/UserAvatar";

type ThreadDetail = {
  id: string;
  title: string;
  createdAt: string;
  author: { name: string; username: string; avatarUrl: string | null };
  pack: { slug: string; name: string };
  replies: {
    id: string;
    content: string;
    createdAt: string;
    author: { name: string; username: string; avatarUrl: string | null };
  }[];
};

type MatilhaThreadViewProps = {
  threadId: string;
};

export function MatilhaThreadView({ threadId }: MatilhaThreadViewProps) {
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/packs/threads/${threadId}`);
    const data = await res.json();
    if (res.ok) setThread(data.thread);
    setLoading(false);
  }, [threadId]);

  useAsyncEffect(load, [load]);

  async function reply() {
    if (!content.trim()) return;
    setSending(true);
    const res = await fetch(`/api/packs/threads/${threadId}`, {
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

  if (loading) {
    return <p className="animate-pulse text-sm text-bc-brown">Lendo tópico…</p>;
  }

  if (!thread) {
    return <p className="text-sm text-bc-brown">Tópico não encontrado.</p>;
  }

  return (
    <article>
      <Link
        href={`/matilhas/${thread.pack.slug}`}
        className="text-sm text-bc-blue hover:underline"
      >
        ← {thread.pack.name}
      </Link>
      <h1 className="mt-3 text-xl font-bold text-bc-blue">{thread.title}</h1>

      <ul className="mt-6 space-y-4">
        {thread.replies.map((r, i) => (
          <li
            key={r.id}
            className={`rounded-xl border p-4 ${
              i === 0 ? "border-bc-caramel/40 bg-bc-caramel/5" : "border-bc-blue/10 bg-bc-white"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <UserAvatar name={r.author.name} avatarUrl={r.author.avatarUrl} size="sm" />
              <Link
                href={`/perfil/${r.author.username}`}
                className="text-sm font-semibold text-bc-blue hover:underline"
              >
                {r.author.name}
              </Link>
              <span className="text-[10px] text-bc-brown/70">
                {new Date(r.createdAt).toLocaleString("pt-BR")}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-bc-brown">{r.content}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-bc-green/30 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={4000}
          placeholder="Sua resposta no fórum…"
          className="bc-input resize-none text-sm"
        />
        <button
          type="button"
          disabled={sending || !content.trim()}
          onClick={reply}
          className="bc-btn-primary mt-2 text-sm"
        >
          {sending ? "Enviando…" : "Responder"}
        </button>
      </div>
    </article>
  );
}
