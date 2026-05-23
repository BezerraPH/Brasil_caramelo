"use client";

import Link from "next/link";
import { useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

const KEY = "bc_welcome_dismissed_v14";

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
    <div className="bc-card bc-animate-in mb-4 border-bc-caramel/30 bg-gradient-to-r from-bc-caramel/10 via-bc-green/10 to-bc-blue/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-bc-blue">🐕 Novidades da matilha!</p>
          <p className="mt-1 text-xs text-bc-brown">
            Cinelar e feed com <strong>HLS no Chrome</strong> (hls.js), Cão de
            Guarda em fotos (heurística + OpenAI opcional) e batalhas com visual
            ao vivo.{" "}
            <Link href="/explorar" className="font-semibold text-bc-green underline">
              Explorar
            </Link>
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
