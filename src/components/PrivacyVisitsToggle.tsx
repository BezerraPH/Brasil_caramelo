"use client";

import { useState } from "react";

type PrivacyVisitsToggleProps = {
  initialShowVisits: boolean;
};

export function PrivacyVisitsToggle({ initialShowVisits }: PrivacyVisitsToggleProps) {
  const [showVisits, setShowVisits] = useState(initialShowVisits);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggle() {
    const next = !showVisits;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showVisits: next }),
      });
      if (!res.ok) {
        setMessage("Não foi possível salvar.");
        return;
      }
      setShowVisits(next);
      setMessage(next ? "Visitas recíprocas ativadas." : "Modo fantasma: suas visitas não são registradas.");
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bc-card mb-6 space-y-3 p-5">
      <h2 className="font-bold text-bc-blue">Privacidade — visitas ao perfil</h2>
      <p className="text-sm text-bc-brown">
        Reciprocidade estrita estilo Orkut: você só vê quem visitou seu perfil se
        permitir que outros saibam quando você visita.
      </p>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={showVisits}
          disabled={saving}
          onChange={toggle}
          className="h-4 w-4 rounded border-bc-blue/30"
        />
        <span className="text-sm text-bc-brown">
          Mostrar quando eu visito perfis (e ver quem me visitou)
        </span>
      </label>
      {message && <p className="text-xs text-bc-green">{message}</p>}
    </section>
  );
}
