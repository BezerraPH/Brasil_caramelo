"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PET_POKE_ACTIONS } from "@/lib/pet-poke";
import type { PetPokeAction } from "@/generated/prisma/enums";

type PetPokePanelProps = {
  toUserId: string;
  canSniff: boolean;
};

export function PetPokePanel({ toUserId, canSniff }: PetPokePanelProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<PetPokeAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function poke(action: PetPokeAction) {
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch("/api/pet-poke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Não foi possível cutucar.");
        return;
      }
      setMessage(data.message ?? "PetPoke enviado! +5 felicidade nos dois pets.");
      router.refresh();
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setBusy(null);
    }
  }

  const actions = PET_POKE_ACTIONS.filter(
    (a) => !a.viralataOnly || canSniff,
  );

  return (
    <div className="mt-4 rounded-xl border border-bc-green/30 bg-bc-green/5 p-4">
      <h3 className="text-sm font-bold text-bc-green">PetPoke 🐾</h3>
      <p className="mb-3 text-xs text-bc-brown">
        Seu cachorro interage com o do amigo (+5 felicidade cada).
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.action}
            type="button"
            disabled={!!busy}
            onClick={() => poke(a.action)}
            className="rounded-full border border-bc-green/40 bg-bc-white px-3 py-1.5 text-xs font-medium text-bc-brown transition hover:bg-bc-green/10 disabled:opacity-60"
          >
            {a.emoji} {a.label}
          </button>
        ))}
      </div>
      {message && (
        <p className="mt-2 text-xs font-medium text-bc-green">{message}</p>
      )}
    </div>
  );
}
