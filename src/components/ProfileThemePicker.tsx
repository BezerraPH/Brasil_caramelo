"use client";

import { useState } from "react";
import { PROFILE_THEMES } from "@/lib/profile-themes";
import type { ProfileTheme } from "@/generated/prisma/enums";
import { useTheme } from "./ThemeProvider";

type ProfileThemePickerProps = {
  initialTheme?: ProfileTheme | null;
};

export function ProfileThemePicker({ initialTheme }: ProfileThemePickerProps) {
  const { palette, setPalette } = useTheme();
  const [current, setCurrent] = useState<ProfileTheme>(initialTheme ?? palette ?? "CLASSIC");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function select(next: ProfileTheme) {
    // 1. Aplicação Instantânea na UI e localStorage
    setPalette(next);
    setCurrent(next);
    setSaving(true);
    setMessage(null);

    // 2. Persistência no Banco de Dados
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileTheme: next }),
      });
      if (!res.ok) {
        setMessage("Aplicado localmente (erro ao sincronizar na nuvem).");
        return;
      }
      setMessage("🎨 Nova paleta aplicada com sucesso em todo o app!");
    } catch {
      setMessage("Aplicado localmente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bc-card mb-6 space-y-4 p-5">
      <div>
        <h2 className="text-base font-black text-bc-blue flex items-center gap-2">
          <span>🎨</span> Cores e Paletas do Aplicativo
        </h2>
        <p className="mt-1 text-xs text-bc-brown">
          Personalize as cores de todo o Brasil Caramelo com temas inspirados no Orkut clássico e na essência da matilha.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PROFILE_THEMES.map((t) => {
          const isSelected = current === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={saving}
              onClick={() => select(t.id)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? "border-bc-blue bg-bc-white ring-4 ring-bc-blue/20 shadow-md dark:bg-slate-800"
                  : "border-bc-caramel/20 bg-bc-white/60 hover:border-bc-blue/40 hover:bg-bc-white dark:bg-slate-900/60"
              }`}
            >
              <div
                className="mb-3 h-12 w-full rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-[1.02]"
                style={{ background: t.banner }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-black text-bc-blue">
                    {t.label}
                  </span>
                  <span className="block text-[11px] font-semibold text-bc-brown/70">
                    {t.tagline}
                  </span>
                </div>
                {isSelected && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bc-blue text-xs text-white shadow-xs">
                    ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {message && (
        <div className="rounded-xl bg-bc-green/15 border border-bc-green/30 p-2.5 text-center text-xs font-bold text-bc-green animate-in fade-in">
          {message}
        </div>
      )}
    </section>
  );
}
