"use client";

import { useState } from "react";

type LocationPinFormProps = {
  initialCity: string | null;
  initialArea: string | null;
  initialShow: boolean;
};

/** Pin de cidade/bairro — Radar de Caramelo (privacidade total). */
export function LocationPinForm({
  initialCity,
  initialArea,
  initialShow,
}: LocationPinFormProps) {
  const [city, setCity] = useState(initialCity ?? "");
  const [area, setArea] = useState(initialArea ?? "");
  const [showLocation, setShowLocation] = useState(initialShow);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationCity: city.trim() || null,
          locationArea: area.trim() || null,
          showLocation,
        }),
      });
      if (!res.ok) {
        setMessage("Não foi possível salvar.");
        return;
      }
      setMessage("Radar de Caramelo atualizado.");
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bc-card mb-6 space-y-3 p-5">
      <h2 className="font-bold text-bc-blue">📍 Radar de Caramelo</h2>
      <p className="text-sm text-bc-brown">
        Marque sua cidade ou bairro — nunca GPS em tempo real. No modo Orkut,
        amigos veem: &ldquo;O Caramelo está circulando por…&rdquo;
      </p>
      <label className="block">
        <span className="bc-label">Cidade</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={80}
          placeholder="Ex.: Recife, São Paulo…"
          className="bc-input w-full"
        />
      </label>
      <label className="block">
        <span className="bc-label">Bairro (opcional)</span>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          maxLength={80}
          placeholder="Ex.: Boa Viagem, Pinheiros…"
          className="bc-input w-full"
        />
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={showLocation}
          disabled={saving || !city.trim()}
          onChange={(e) => setShowLocation(e.target.checked)}
          className="h-4 w-4 rounded border-bc-blue/30"
        />
        <span className="text-sm text-bc-brown">
          Exibir região no meu perfil (modo Orkut)
        </span>
      </label>
      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="bc-btn-primary text-sm"
      >
        {saving ? "Salvando…" : "Salvar pin"}
      </button>
      {message && <p className="text-xs text-bc-green">{message}</p>}
    </section>
  );
}
