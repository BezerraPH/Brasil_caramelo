"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";

type TestimonialItem = {
  id: string;
  content: string;
  acceptedAt: string | null;
  fromUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

type TestimonialsSectionProps = {
  toUserId: string;
  toUsername: string;
  accepted: TestimonialItem[];
  canWrite: boolean;
};

export function TestimonialsSection({
  toUserId,
  toUsername,
  accepted,
  canWrite,
}: TestimonialsSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const top = accepted[0] ?? null;
  const rest = accepted.slice(1);

  async function send() {
    if (!content.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Erro ao enviar.");
        return;
      }
      setContent("");
      setMessage("Depoimento enviado! Aguardando aceite.");
      router.refresh();
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 space-y-4 border-t border-bc-blue/10 pt-6">
      <h2 className="font-bold text-bc-blue">Depoimentos</h2>

      {top && (
        <article className="relative rounded-2xl border-2 border-bc-gold/60 bg-gradient-to-br from-bc-gold/15 to-bc-caramel/10 p-4">
          <span className="inline-flex rounded-full bg-bc-gold px-3 py-0.5 text-xs font-bold text-white shadow">
            👑 Dono do Topo
          </span>
          <div className="mt-3 flex items-start gap-3">
            <UserAvatar
              name={top.fromUser.name}
              avatarUrl={top.fromUser.avatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-bc-blue">
                {top.fromUser.name}
              </p>
              <p className="text-xs text-bc-brown">@{top.fromUser.username}</p>
              <p className="mt-2 text-sm leading-relaxed text-bc-brown">
                {top.content}
              </p>
            </div>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <ul className="space-y-3">
          {rest.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-bc-blue/15 bg-bc-white/80 p-3"
            >
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={t.fromUser.name}
                  avatarUrl={t.fromUser.avatarUrl}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-semibold text-bc-blue">
                    {t.fromUser.name}
                  </p>
                  <p className="text-sm text-bc-brown">{t.content}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!top && !canWrite && (
        <p className="text-sm text-bc-brown/80">
          Nenhum depoimento aceito ainda.
        </p>
      )}

      {canWrite && (
        <div className="rounded-xl border border-bc-caramel/30 bg-bc-caramel/5 p-4">
          <p className="mb-2 text-xs font-semibold text-bc-brown">
            Escreva um depoimento para @{toUsername}
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Conte o que essa pessoa significa na matilha…"
            className="bc-input resize-none text-sm"
          />
          <button
            type="button"
            disabled={saving || !content.trim()}
            onClick={send}
            className="bc-btn-primary mt-2 text-sm"
          >
            {saving ? "Enviando…" : "Enviar depoimento"}
          </button>
          {message && (
            <p className="mt-2 text-xs text-bc-green">{message}</p>
          )}
        </div>
      )}
    </section>
  );
}
