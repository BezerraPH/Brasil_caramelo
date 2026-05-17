"use client";

import { useState } from "react";
import { DOG_REPUTATION_LEVELS, REPUTATION_BY_LEVEL } from "@/lib/constants";

export function RolezinhoPanel({ isPremium }: { isPremium: boolean }) {
  const [title, setTitle] = useState("Hora do Rolezinho!");
  const [message, setMessage] = useState(
    "Todos os Caramelos ganham 2x moedas nos próximos 15 minutos!",
  );
  const [targetLevel, setTargetLevel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function startEvent() {
    setLoading(true);
    setFeedback(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        message,
        durationMinutes: 15,
        coinMultiplier: 2,
        targetLevel: targetLevel || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setFeedback("Rolezinho disparado para a matilha! 🎉");
    else setFeedback(data.error ?? "Não foi possível iniciar.");
  }

  return (
    <section className="bc-card p-6">
      <h2 className="font-bold text-bc-blue">Iniciar evento flash</h2>
      <p className="mb-4 text-xs text-bc-brown">
        {isPremium
          ? "Como Pedigree, você pode iniciar rolezinhos."
          : "Premium ou admin pode iniciar rolezinhos."}
      </p>
      <div className="space-y-3">
        <input
          className="bc-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
        />
        <textarea
          className="bc-input resize-none"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem"
        />
        <select
          className="bc-input"
          value={targetLevel}
          onChange={(e) => setTargetLevel(e.target.value)}
        >
          <option value="">Toda a matilha</option>
          {DOG_REPUTATION_LEVELS.map((l) => (
            <option key={l} value={l}>
              Só {REPUTATION_BY_LEVEL[l].breed}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={loading || !isPremium}
          onClick={startEvent}
          className="bc-btn-gold w-full"
        >
          {loading ? "Disparando…" : "🎉 Iniciar rolezinho"}
        </button>
      </div>
      {feedback && (
        <p className="mt-3 text-center text-sm font-medium text-bc-green">
          {feedback}
        </p>
      )}
    </section>
  );
}
