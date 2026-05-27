"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VIEW_MODES } from "@/lib/constants";
import { useToast } from "./ToastProvider";

type ViewModeSwitcherProps = {
  currentMode: "FEED" | "INSTA" | "REELS";
};

export function ViewModeSwitcher({ currentMode }: ViewModeSwitcherProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function select(mode: "FEED" | "INSTA" | "REELS") {
    const item = VIEW_MODES.find((m) => m.id === mode);
    if (!item?.available) return;

    setSaving(true);
    setOpen(false);
    document.body.classList.add("bc-mode-switching");
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewMode: mode }),
    });
    setSaving(false);
    if (res.ok) {
      router.refresh();
    } else {
      toast("Não foi possível trocar o modo.");
    }
  }

  return (
    <div className="bc-view-fab fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
      {open && (
        <div className="bc-menu-enter absolute bottom-16 right-0 flex flex-col gap-2">
          {VIEW_MODES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              disabled={!m.available || saving}
              onClick={() => select(m.id as "FEED" | "INSTA" | "REELS")}
              style={{ animationDelay: `${i * 0.05}s` }}
              className={`bc-animate-scale flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition ${
                m.id === currentMode
                  ? "bg-bc-green text-white"
                  : m.available
                    ? "bg-bc-white text-bc-blue hover:bg-bc-green/10"
                    : "cursor-not-allowed bg-bc-white/80 text-bc-brown/50"
              }`}
            >
              <span>
                {m.id === "FEED" ? "📰" : m.id === "INSTA" ? "📷" : "🎬"}
              </span>
              {m.label}
              {!m.available && (
                <span className="text-[10px] font-normal">(breve)</span>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        title="Trocar modo de visualização"
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-bc-caramel to-bc-green text-2xl text-white shadow-lg ring-4 ring-bc-white transition hover:scale-105 active:scale-95 ${open ? "bc-animate-pop" : ""}`}
        aria-expanded={open}
      >
        🐾
      </button>
    </div>
  );
}
