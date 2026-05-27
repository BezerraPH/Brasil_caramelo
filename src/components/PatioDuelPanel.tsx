"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PatioDuelPanelProps = {
  opponentId: string;
  opponentName: string;
};

export function PatioDuelPanel({ opponentId, opponentName }: PatioDuelPanelProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function duel() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/patio-duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(data.error ?? "Duelo falhou.");
        return;
      }
      setResult(
        data.won
          ? `Vitória! ${data.winnerPet} venceu ${data.loserPet}. Você é Rei do Pátio por 24h!`
          : `${data.winnerPet} venceu ${data.loserPet}. Treine o pet e tente de novo!`,
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-bc-gold/40 bg-bc-gold/10 p-3">
      <p className="text-xs font-bold text-bc-brown">⚔️ Duelo de Pátio</p>
      <p className="mt-1 text-[11px] text-bc-brown">
        Desafie o pet de {opponentName}. Vencedor ganha 👑 Rei do Pátio por 24h.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={duel}
        className="bc-btn-secondary mt-2 text-xs"
      >
        {busy ? "Duelando…" : "Iniciar duelo"}
      </button>
      {result && <p className="mt-2 text-xs text-bc-green">{result}</p>}
    </div>
  );
}
