"use client";

import { useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

const KEY = "bc_welcome_dismissed_v26";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useAsyncEffect(() => {
    const show =
      typeof window !== "undefined" && !localStorage.getItem(KEY);
    setVisible(show);
    setReady(true);
  }, []);

  if (!ready || !visible) return null;

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setVisible(false);
  }

  return (
    <div className="bc-card bc-animate-in mb-4 border-bc-blue/30 bg-gradient-to-r from-bc-blue/10 via-bc-green/10 to-bc-caramel/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-bc-blue">📱 Novidades v2.4.9!</p>
          <p className="mt-1 text-xs text-bc-brown">
            Chamadas em qualquer tela (CallProvider), aviso de HTTPS no celular,
            Latidos com botão “Tocar áudio” e LiveKit só com IP da LAN.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="bc-btn-ghost text-xs"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
