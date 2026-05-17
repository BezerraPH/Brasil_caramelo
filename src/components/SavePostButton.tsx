"use client";

import { useState } from "react";

export function SavePostButton({
  postId,
  initialSaved = false,
}: {
  postId: string;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (res.ok) setSaved(data.saved);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remover dos salvos" : "Salvar recado"}
      className={`rounded-lg px-2 py-1 text-sm transition hover:bg-bc-blue/10 ${saved ? "text-bc-caramel" : "text-bc-brown"}`}
      aria-pressed={saved}
    >
      {saved ? "🔖 Salvo" : "🔖 Salvar"}
    </button>
  );
}
