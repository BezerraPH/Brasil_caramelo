"use client";

import { useCallback, useEffect, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { reportOpsClient } from "@/lib/ops-client";
import { flushOfflinePosts, listOfflinePosts } from "@/lib/offline-post-queue";
import { useRouter } from "next/navigation";

export function OfflinePostBanner() {
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const pending = await listOfflinePosts();
    setCount(pending.length);
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const n = await flushOfflinePosts();
      await refresh();
      if (n > 0) {
        reportOpsClient("offline_queue_flush", `${n} recados`);
        router.refresh();
      }
    } finally {
      setSyncing(false);
    }
  }, [refresh, router]);

  useAsyncEffect(refresh, [refresh]);

  useEffect(() => {
    const onOnline = () => void sync();
    window.addEventListener("online", onOnline);
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === "BC_FLUSH_OFFLINE_POSTS") void sync();
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onMessage);
    }
    return () => {
      window.removeEventListener("online", onOnline);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onMessage);
      }
    };
  }, [sync]);

  if (count === 0) return null;

  return (
    <div className="bc-card mb-4 border-bc-caramel/40 bg-bc-caramel/10 p-4 bc-animate-in">
      <p className="text-sm font-semibold text-bc-blue">
        📡 {count} recado{count > 1 ? "s" : ""} na fila offline
      </p>
      <p className="mt-1 text-xs text-bc-brown">
        Serão publicados quando a rede voltar.
      </p>
      <button
        type="button"
        disabled={syncing || !navigator.onLine}
        onClick={() => void sync()}
        className="bc-btn-primary mt-3 text-xs"
      >
        {syncing ? "Enviando…" : "Enviar agora"}
      </button>
    </div>
  );
}

export { useOfflinePostSubmit } from "@/hooks/use-offline-post-submit";
