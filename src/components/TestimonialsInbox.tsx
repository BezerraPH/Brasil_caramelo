"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "@/components/UserAvatar";
import { parseTestimonialThread } from "@/lib/testimonials-thread";

type PendingItem = {
  id: string;
  content: string;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

export function TestimonialsInbox() {
  const router = useRouter();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/testimonials?mode=pending");
    const data = await res.json();
    if (res.ok) setItems(data.pending ?? []);
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  async function accept(id: string) {
    setBusy(id);
    await fetch(`/api/testimonials/${id}`, { method: "PATCH" });
    await load();
    router.refresh();
    setBusy(null);
  }

  async function reject(id: string) {
    setBusy(id);
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    await load();
    setBusy(null);
  }

  async function reply(toUserId: string, threadId: string) {
    const content = replyDraft[threadId]?.trim();
    if (!content) return;
    setBusy(threadId);
    await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, content }),
    });
    setReplyDraft((d) => ({ ...d, [threadId]: "" }));
    await load();
    setBusy(null);
  }

  if (loading) {
    return (
      <p className="text-sm text-bc-brown animate-pulse">Carregando depoimentos…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-bc-blue/10 bg-bc-white/60 p-6 text-center text-sm text-bc-brown">
        Nenhum depoimento pendente. Quando alguém escrever, aparece aqui como
        conversa privada até você aceitar.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border-2 border-bc-blue/15 bg-bc-white p-4"
        >
          <div className="mb-3 flex items-center gap-3">
            <UserAvatar
              name={item.fromUser.name}
              avatarUrl={item.fromUser.avatarUrl}
              size="sm"
            />
            <div>
              <Link
                href={`/perfil/${item.fromUser.username}`}
                className="font-semibold text-bc-blue hover:underline"
              >
                {item.fromUser.name}
              </Link>
              <p className="text-xs text-bc-brown">Depoimento não aceito</p>
            </div>
          </div>

          <div className="rounded-xl bg-bc-blue/5 px-4 py-3 text-sm text-bc-brown">
            {parseTestimonialThread(item.content).mainText}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy === item.id}
              onClick={() => accept(item.id)}
              className="bc-btn-primary text-sm"
            >
              Aceitar
            </button>
            <button
              type="button"
              disabled={busy === item.id}
              onClick={() => reject(item.id)}
              className="bc-btn-secondary text-sm"
            >
              Não aceita
            </button>
          </div>

          <div className="mt-4 border-t border-bc-blue/10 pt-4">
            <p className="mb-2 text-xs font-semibold text-bc-brown">
              Responder (envia novo depoimento pendente)
            </p>
            <textarea
              value={replyDraft[item.id] ?? ""}
              onChange={(e) =>
                setReplyDraft((d) => ({ ...d, [item.id]: e.target.value }))
              }
              rows={2}
              maxLength={1000}
              placeholder="Sua resposta…"
              className="bc-input resize-none text-sm"
            />
            <button
              type="button"
              disabled={busy === item.id || !replyDraft[item.id]?.trim()}
              onClick={() => reply(item.fromUser.id, item.id)}
              className="bc-btn-ghost mt-2 text-sm"
            >
              Responder
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
