"use client";

import Link from "next/link";
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
    if (!isPremium) return;
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
    if (res.ok) setFeedback("Rolezinho disparado para toda a matilha! 🎉");
    else setFeedback(data.error ?? "Não foi possível iniciar.");
  }

  if (!isPremium) {
    return (
      <section className="bc-card p-6 text-center border border-bc-gold/30 bg-gradient-to-b from-bc-white to-amber-500/5 shadow-sm">
        <span className="text-4xl">👑🎉</span>
        <h2 className="mt-3 text-lg font-black text-bc-blue">Iniciar Rolezinho da Matilha</h2>
        <p className="mx-auto mt-1 max-w-md text-xs font-semibold text-bc-brown">
          Dispare eventos relâmpago que dão <strong>2x CarameloCoins</strong> para toda a rede durante 15 minutos! Exclusivo para assinantes Pedigree.
        </p>
        <Link
          href="/premium"
          className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition"
        >
          Tornar-se Pedigree & Desbloquear Rolezinhos
        </Link>
      </section>
    );
  }

  return (
    <section className="bc-card p-6 border border-bc-caramel/25 bg-bc-white shadow-sm">
      <h2 className="text-lg font-black text-bc-blue flex items-center gap-2">
        <span>🎉</span> Iniciar Evento Flash (Rolezinho)
      </h2>
      <p className="mb-4 text-xs font-semibold text-bc-brown">
        Como membro Pedigree, você pode premiar a comunidade com bônus de moedas!
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-bc-brown mb-1">Título do Evento</label>
          <input
            className="w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs font-bold text-bc-brown focus:border-bc-green focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do rolezinho..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-bc-brown mb-1">Mensagem para a Matilha</label>
          <textarea
            className="w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs font-medium text-bc-brown focus:border-bc-green focus:outline-none resize-none"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensagem explicativa..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-bc-brown mb-1">Público Alvo</label>
          <select
            className="w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs font-bold text-bc-brown focus:border-bc-green focus:outline-none"
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
          >
            <option value="">Toda a matilha (Geral)</option>
            {DOG_REPUTATION_LEVELS.map((l) => (
              <option key={l} value={l}>
                Só {REPUTATION_BY_LEVEL[l].breed}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={startEvent}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition"
        >
          {loading ? "Disparando rolezinho…" : "🎉 Iniciar Rolezinho Agora (2x Moedas)"}
        </button>
      </div>

      {feedback && (
        <p className="mt-3 text-center text-xs font-bold text-bc-green">
          {feedback}
        </p>
      )}
    </section>
  );
}
