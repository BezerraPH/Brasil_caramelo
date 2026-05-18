"use client";

import { useState } from "react";
import type { ReactionType } from "@/generated/prisma/enums";
import { REACTIONS } from "@/lib/reactions";

type ReactionPickerProps = {
  postId: string;
  initialReaction: string | null;
  initialCount: number;
  onUpdate?: (reaction: string | null, count: number) => void;
};

export function ReactionPicker({
  postId,
  initialReaction,
  initialCount,
  onUpdate,
}: ReactionPickerProps) {
  const [reaction, setReaction] = useState<string | null>(initialReaction);
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);
  const [anim, setAnim] = useState(false);

  async function pick(type: ReactionType) {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction: type }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setReaction(data.reacted ? data.reaction : null);
    setCount(data.likeCount);
    onUpdate?.(data.reacted ? data.reaction : null, data.likeCount);
    setOpen(false);
    if (data.reacted) {
      setAnim(true);
      setTimeout(() => setAnim(false), 400);
    }
  }

  const active = REACTIONS.find((r) => r.type === reaction);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`bc-ripple inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
          reaction
            ? "bg-bc-green/15 text-bc-green"
            : "text-bc-brown hover:bg-bc-brown/10 hover:text-bc-green"
        } ${anim ? "bc-animate-pop" : ""}`}
      >
        {active ? active.emoji : "🤍"}{" "}
        {active ? active.label : "Reagir"} ({count})
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div className="bc-menu-enter absolute bottom-full left-0 z-40 mb-1 flex gap-1 rounded-2xl border border-bc-blue/15 bg-bc-white p-1.5 shadow-lg">
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                type="button"
                title={r.label}
                onClick={() => void pick(r.type)}
                className={`rounded-xl px-2.5 py-1.5 text-lg transition hover:scale-110 hover:bg-bc-green/10 ${
                  reaction === r.type ? "bg-bc-green/15 ring-1 ring-bc-green/30" : ""
                }`}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
