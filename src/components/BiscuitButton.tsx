"use client";

import { useState } from "react";

type BiscuitButtonProps = {
  postId: string;
  authorId: string;
  currentUserId?: string;
  initialCount?: number;
};

export function BiscuitButton({
  postId,
  authorId,
  currentUserId,
  initialCount = 0,
}: BiscuitButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [given, setGiven] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!currentUserId || currentUserId === authorId) return null;

  async function give() {
    if (given || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}/biscuit`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setGiven(true);
        setCount(data.biscuitCount ?? count + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy || given}
      onClick={give}
      title="Enviar Biscoito — moeda social da matilha"
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition ${
        given
          ? "bg-bc-caramel/20 text-bc-caramel"
          : "text-bc-brown hover:bg-bc-caramel/10"
      }`}
    >
      🍪 {count > 0 && <span>{count}</span>}
      {!given && <span className="sr-only">Dar biscoito</span>}
    </button>
  );
}
