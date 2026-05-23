"use client";

import { useState } from "react";
import { useToast } from "./ToastProvider";

export function ReportPostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function report() {
    if (!confirm("Denunciar este recado por conteúdo inadequado?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/report`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        if (data.tribunalOpened) {
          toast(
            "Denúncia registrada. O Tribunal do Cão foi aberto para este recado.",
            "achievement",
          );
        } else {
          toast(
            data.alreadyReported ? "Você já denunciou este recado." : "Denúncia registrada. Obrigado.",
          );
        }
      } else {
        toast(data.error ?? "Não foi possível denunciar.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void report()}
      disabled={loading}
      className="rounded-lg px-2 py-1 text-sm text-bc-brown/70 transition hover:bg-bc-brown/10 hover:text-bc-brown"
      title="Denunciar"
    >
      {loading ? "…" : "🚩"}
    </button>
  );
}
