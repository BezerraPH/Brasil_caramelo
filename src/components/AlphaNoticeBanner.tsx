"use client";

import { useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { getVersionDisplay } from "@/lib/app-version";
import { AppVersionBadge } from "./AppVersionBadge";

const STORAGE_KEY = "bc_alpha_notice_v220";

export function AlphaNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useAsyncEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      localStorage.getItem(STORAGE_KEY) === "1";
    setVisible(!dismissed);
    setReady(true);
  }, []);

  if (!ready || !visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div
      className="bc-alpha-notice bc-animate-in border-b border-bc-caramel/30 bg-gradient-to-r from-bc-caramel/20 via-bc-gold/10 to-bc-green/10 px-4 py-2"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 text-center text-xs text-bc-brown">
        <AppVersionBadge />
        <span>
          Você está usando o <strong className="text-bc-blue">Brasil Caramelo</strong>{" "}
          em <strong>Alpha</strong> ({getVersionDisplay()}) — feedback é bem-vindo!
        </span>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-0.5 font-semibold text-bc-blue hover:bg-bc-blue/10"
          aria-label="Fechar aviso alpha"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
