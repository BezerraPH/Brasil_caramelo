"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAchievementToast } from "@/lib/achievement-defs";
import { useToast } from "./ToastProvider";

type FederationSyncButtonProps = {
  className?: string;
  fullWidth?: boolean;
};

export function FederationSyncButton({
  className = "",
  fullWidth = false,
}: FederationSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  async function sync() {
    setSyncing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/federation/sync", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        peers?: number;
        imported?: number;
        achievement?: boolean;
      };
      if (res.ok) {
        const n = data.imported ?? 0;
        setMsg(
          data.peers
            ? `Sincronizado com ${data.peers} peer(s). ${n} recado(s) importado(s).`
            : "Nenhum peer configurado — adicione em configurações.",
        );
        if (data.achievement) {
          toast(formatAchievementToast("FEDERATION_SYNC"), "achievement");
        }
        router.refresh();
      } else {
        setMsg(data.error ?? "Falha ao sincronizar.");
      }
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={syncing}
        onClick={() => void sync()}
        className={`bc-btn-primary bc-ripple ${fullWidth ? "w-full" : ""}`}
      >
        {syncing ? "Sincronizando…" : "🌐 Sincronizar peers (LAN + Tailscale)"}
      </button>
      {msg && (
        <p className="mt-2 text-xs text-bc-green bc-animate-in">{msg}</p>
      )}
    </div>
  );
}
