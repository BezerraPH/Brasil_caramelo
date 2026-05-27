"use client";

import { useState } from "react";
import { PROFILE_THEMES } from "@/lib/profile-themes";
import type { ProfileTheme } from "@/generated/prisma/enums";

type ProfileThemePickerProps = {
  initialTheme: ProfileTheme;
};

export function ProfileThemePicker({ initialTheme }: ProfileThemePickerProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function select(next: ProfileTheme) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileTheme: next }),
      });
      if (!res.ok) {
        setMessage("Não foi possível salvar o tema.");
        return;
      }
      setTheme(next);
      setMessage("Paleta da Matilha aplicada!");
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bc-card mb-6 space-y-3 p-5">
      <h2 className="font-bold text-bc-blue">Paleta do perfil (orcutar)</h2>
      <p className="text-sm text-bc-brown">
        Escolha as cores do seu perfil — estilo Orkut com toque canino.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PROFILE_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={saving}
            onClick={() => select(t.id)}
            className={`rounded-xl border-2 p-3 text-left transition ${
              theme === t.id ? "border-bc-green ring-2 ring-bc-green/30" : "border-bc-blue/15"
            }`}
          >
            <div
              className="mb-2 h-8 rounded-lg"
              style={{ background: t.banner }}
            />
            <span className="text-sm font-semibold text-bc-blue">{t.label}</span>
          </button>
        ))}
      </div>
      {message && <p className="text-xs text-bc-green">{message}</p>}
    </section>
  );
}
