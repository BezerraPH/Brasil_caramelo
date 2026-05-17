"use client";

import Link from "next/link";
import { useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

const KEY = "bc_welcome_dismissed_v12";

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
    <div className="bc-card bc-animate-in mb-4 border-bc-green/30 bg-gradient-to-r from-bc-green/10 to-bc-blue/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-bc-blue">🐕 Bem-vindo à matilha!</p>
          <p className="mt-1 text-xs text-bc-brown">
            Mídia no seu servidor, stories 24h, salvos, missão diária do pet e
            muito mais. Explore o hub{" "}
            <Link href="/explorar" className="font-semibold text-bc-green underline">
              Explorar
            </Link>
            .
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
