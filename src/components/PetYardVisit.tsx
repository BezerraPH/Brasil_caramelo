"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { PetPokePanel } from "@/components/PetPokePanel";

type VisitData = {
  owner: { name: string; username: string };
  pet: {
    name: string;
    color: string;
    hunger: number;
    happiness: number;
    energy: number;
    level: number;
    coins: number;
  };
  mood: { label: string; emoji: string; color: string };
  canTreat: boolean;
  canPoke: boolean;
  canSniff: boolean;
  treatsTogether: number;
  closeFriends: boolean;
};

type PetYardVisitProps = {
  ownerUserId: string;
};

export function PetYardVisit({ ownerUserId }: PetYardVisitProps) {
  const [data, setData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [treating, setTreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/pet/visit/${ownerUserId}`);
    const json = await res.json();
    if (res.ok) setData(json);
    setLoading(false);
  }, [ownerUserId]);

  useAsyncEffect(load, [load]);

  async function giveTreat() {
    setTreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pet/treat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: ownerUserId }),
      });
      const json = await res.json();
      if (res.ok) {
        setData((d) =>
          d
            ? {
                ...d,
                pet: json.pet,
                mood: json.mood,
                treatsTogether: json.treatsTogether,
                closeFriends: json.closeFriends,
              }
            : d,
        );
        setMessage("Petisco entregue! 🦴");
      } else {
        setMessage(json.error ?? "Não foi possível dar o petisco.");
      }
    } finally {
      setTreating(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-6 rounded-2xl border border-bc-blue/10 bg-bc-white/60 p-4 text-center text-sm text-bc-brown animate-pulse">
        Cheirando o quintal…
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="mt-6 rounded-2xl border-2 border-bc-caramel/30 bg-gradient-to-br from-bc-caramel/10 to-bc-green/5 p-5">
      <h2 className="mb-1 font-bold text-bc-blue">Quintal de {data.owner.name}</h2>
      <p className="mb-4 text-xs text-bc-brown">
        O cachorro virtual de @{data.owner.username}
      </p>

      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl"
          style={{
            backgroundColor: `${data.pet.color}33`,
            border: `3px solid ${data.pet.color}`,
          }}
        >
          🐕
        </div>
        <div>
          <p className="font-semibold text-bc-blue">{data.pet.name}</p>
          <p className="text-sm" style={{ color: data.mood.color }}>
            {data.mood.emoji} {data.mood.label}
          </p>
          <p className="text-xs text-bc-brown">
            Nv. {data.pet.level} · {data.pet.coins} CarameloCoins
          </p>
        </div>
      </div>

      {data.closeFriends && (
        <p className="mt-3 rounded-lg bg-bc-green/15 px-3 py-2 text-center text-xs font-semibold text-bc-green">
          🏅 Badge: Cachorreiros Próximos
        </p>
      )}

      {!data.closeFriends && data.treatsTogether > 0 && (
        <p className="mt-2 text-center text-xs text-bc-brown">
          {data.treatsTogether}/5 interações para o badge de amizade
        </p>
      )}

      {data.canTreat ? (
        <button
          type="button"
          disabled={treating}
          onClick={giveTreat}
          className="bc-btn-primary mt-4 w-full"
        >
          {treating ? "Entregando…" : "🦴 Dar petisco"}
        </button>
      ) : (
        <p className="mt-4 text-center text-xs text-bc-brown">
          Sejam amigos para visitar e dar petiscos.
        </p>
      )}

      {message && (
        <p className="mt-2 text-center text-xs font-medium text-bc-green">{message}</p>
      )}

      {data.canPoke && (
        <PetPokePanel toUserId={ownerUserId} canSniff={data.canSniff} />
      )}
    </section>
  );
}
