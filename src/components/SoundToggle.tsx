"use client";

import { useState } from "react";
import { isSoundMuted, playCoinSound, setSoundMuted } from "@/lib/sound-fx";

export function SoundToggle() {
  const [muted, setMuted] = useState(() =>
    typeof window !== "undefined" ? isSoundMuted() : false
  );

  function handleToggle() {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) {
      playCoinSound();
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center gap-1 rounded-xl p-1.5 text-xs font-bold transition border ${
        muted
          ? "border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-400"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      }`}
      title={muted ? "Sons Silenciados (Clique para Ativar)" : "Sons Ativados (Clique para Silenciar)"}
    >
      <span>{muted ? "🔇" : "🔊"}</span>
      <span className="hidden md:inline text-[11px]">{muted ? "Mudo" : "Sons"}</span>
    </button>
  );
}
