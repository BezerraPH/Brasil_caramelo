"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./ToastProvider";

export function DeletePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function remove() {
    if (!confirm("Apagar este recado? Não dá para desfazer.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        toast("Recado apagado.");
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error ?? "Não foi possível apagar.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void remove()}
      disabled={loading}
      className="rounded-lg px-2 py-1 text-sm text-red-600/80 transition hover:bg-red-50 hover:text-red-700"
    >
      {loading ? "…" : "🗑 Apagar"}
    </button>
  );
}
