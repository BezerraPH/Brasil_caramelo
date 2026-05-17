"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./ToastProvider";

export function FeedRefreshButton() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    router.refresh();
    toast("Feed atualizado!");
    setTimeout(() => setLoading(false), 600);
  }

  return (
    <button
      type="button"
      onClick={() => void refresh()}
      disabled={loading}
      className="bc-btn-ghost text-xs"
      aria-label="Atualizar feed"
    >
      {loading ? "↻ …" : "↻ Atualizar"}
    </button>
  );
}
