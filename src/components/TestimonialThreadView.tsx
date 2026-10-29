"use client";

import { useState } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import {
  parseTestimonialThread,
  type TestimonialReply,
} from "@/lib/testimonials-thread";

type TestimonialThreadViewProps = {
  testimonialId: string;
  rawContent: string;
  canReply?: boolean;
  onReplied?: () => void;
};

export function TestimonialThreadView({
  testimonialId,
  rawContent,
  canReply = true,
  onReplied,
}: TestimonialThreadViewProps) {
  const { mainText, replies: initialReplies } = parseTestimonialThread(rawContent);
  const [replies, setReplies] = useState<TestimonialReply[]>(initialReplies);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSendReply() {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/testimonials/${testimonialId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao responder.");
      }

      if (data.reply) {
        setReplies((prev) => [...prev, data.reply]);
      }
      setReplyText("");
      setShowReplyBox(false);
      if (onReplied) onReplied();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de conexão";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Texto principal do depoimento */}
      <p className="text-sm leading-relaxed text-bc-brown dark:text-slate-200">
        {mainText}
      </p>

      {/* Thread de respostas (Scrapbook Thread R-SOC-01) */}
      {replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-bc-caramel/30 pl-3 pt-1 dark:border-amber-500/30">
          <p className="text-[11px] font-bold tracking-wider text-bc-caramel uppercase">
            💬 Respostas do Scrapbook ({replies.length})
          </p>
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-xl border border-bc-caramel/15 bg-bc-sand/20 p-2.5 text-xs dark:border-white/10 dark:bg-slate-800/60"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-bc-blue dark:text-sky-400">
                  <UserAvatar
                    name={reply.fromName}
                    avatarUrl={reply.fromAvatarUrl ?? null}
                    size="sm"
                  />
                  <Link
                    href={`/perfil/${reply.fromUsername}`}
                    className="hover:underline"
                  >
                    {reply.fromName}
                  </Link>
                  <span className="text-[10px] font-normal text-bc-brown/60 dark:text-slate-400">
                    @{reply.fromUsername}
                  </span>
                </div>
                <time className="text-[10px] text-bc-brown/50 dark:text-slate-400">
                  {new Date(reply.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="mt-1.5 leading-relaxed text-bc-brown dark:text-slate-200">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Ação de responder à thread */}
      {canReply && (
        <div className="pt-1">
          {!showReplyBox ? (
            <button
              type="button"
              onClick={() => setShowReplyBox(true)}
              className="text-xs font-bold text-bc-blue hover:text-bc-caramel transition dark:text-sky-400 dark:hover:text-amber-400"
            >
              💬 Responder ao recado…
            </button>
          ) : (
            <div className="mt-2 rounded-xl border border-bc-caramel/25 bg-bc-sand/30 p-3 space-y-2 dark:border-white/15 dark:bg-slate-800">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta para este recado…"
                maxLength={500}
                rows={2}
                className="w-full rounded-lg border border-bc-caramel/30 bg-bc-white p-2 text-xs text-bc-brown outline-none focus:border-bc-blue dark:border-white/20 dark:bg-slate-900 dark:text-slate-100"
              />
              {errorMsg && (
                <p className="text-xs font-semibold text-red-500">{errorMsg}</p>
              )}
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowReplyBox(false)}
                  className="rounded-lg px-2.5 py-1 text-bc-brown/70 hover:text-bc-brown dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={submitting || !replyText.trim()}
                  onClick={handleSendReply}
                  className="rounded-lg bg-bc-blue px-3 py-1 font-bold text-bc-white hover:bg-bc-blue-dark transition disabled:opacity-50"
                >
                  {submitting ? "Enviando…" : "Responder"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
