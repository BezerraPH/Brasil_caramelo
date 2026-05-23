"use client";

import { useEffect, useState } from "react";
import { canUseMediaDevices, mediaDevicesBlockedReason } from "@/lib/media-devices";

type ConnectionPayload = {
  mode?: string;
  hints?: string[];
  livekitConfigured?: boolean;
};

export function MatilhaConnectionBanner() {
  const [payload, setPayload] = useState<ConnectionPayload | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("bc-connection-banner-dismiss") === "1") {
      setDismissed(true);
      return;
    }
    fetch("/api/matilha/connection")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPayload(data))
      .catch(() => null);
  }, []);

  if (dismissed || !payload) return null;

  const secure = canUseMediaDevices();
  const needsHttps = !secure;
  const blockedReason = mediaDevicesBlockedReason();
  const hints = payload.hints ?? [];
  const show = needsHttps || hints.length > 0;

  if (!show) return null;

  function dismiss() {
    sessionStorage.setItem("bc-connection-banner-dismiss", "1");
    setDismissed(true);
  }

  return (
    <div
      className="bc-connection-banner bc-animate-in border-b border-bc-caramel/30 bg-gradient-to-r from-bc-caramel/15 to-bc-green/10 px-4 py-2.5 text-center text-xs text-bc-brown"
      role="status"
    >
      <p className="font-semibold text-bc-blue">
        {needsHttps
          ? "Conexão não segura — microfone e Latidos podem falhar"
          : payload.mode === "tailscale"
            ? "Modo Tailscale — mantenha o app ligado"
            : "Dica da matilha"}
      </p>
      {needsHttps && blockedReason && (
        <p className="mt-1">{blockedReason}</p>
      )}
      {hints.map((h) => (
        <p key={h} className="mt-1">
          {h}
        </p>
      ))}
      <button
        type="button"
        onClick={dismiss}
        className="bc-btn-ghost mt-2 text-[10px] text-bc-brown"
      >
        Entendi, ocultar
      </button>
    </div>
  );
}
