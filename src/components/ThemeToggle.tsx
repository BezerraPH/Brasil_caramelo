"use client";

import { useEffect, useState } from "react";
import { applyTheme, getSavedTheme, initThemeListener, type ThemeMode } from "@/lib/theme";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    setMode(getSavedTheme());
    const cleanup = initThemeListener();
    return cleanup;
  }, []);

  function handleSelect(nextMode: ThemeMode) {
    setMode(nextMode);
    applyTheme(nextMode);
  }

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-bc-caramel/25 bg-bc-sand/30 p-1 dark:border-white/15 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => handleSelect("system")}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
          mode === "system"
            ? "bg-bc-blue text-white shadow-xs"
            : "text-bc-brown/70 hover:text-bc-brown dark:text-slate-300 dark:hover:text-white"
        }`}
        title="Automático (Acompanha o sistema operacional)"
      >
        <span>🖥️</span>
        <span className="hidden sm:inline">Auto</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect("light")}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
          mode === "light"
            ? "bg-amber-500 text-white shadow-xs"
            : "text-bc-brown/70 hover:text-bc-brown dark:text-slate-300 dark:hover:text-white"
        }`}
        title="Modo Claro"
      >
        <span>☀️</span>
        <span className="hidden sm:inline">Claro</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect("dark")}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
          mode === "dark"
            ? "bg-slate-900 text-amber-400 border border-amber-400/30 shadow-xs"
            : "text-bc-brown/70 hover:text-bc-brown dark:text-slate-300 dark:hover:text-white"
        }`}
        title="Modo Escuro (OLED)"
      >
        <span>🌙</span>
        <span className="hidden sm:inline">Escuro</span>
      </button>
    </div>
  );
}
