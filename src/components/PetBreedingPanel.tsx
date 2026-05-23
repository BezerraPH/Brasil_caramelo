"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { REPUTATION_BY_LEVEL } from "@/lib/constants";
import type { DogReputationLevel } from "@/generated/prisma/enums";
import { formatAchievementToast } from "@/lib/achievement-defs";
import type { AchievementKey } from "@/lib/achievement-defs";
import { useToast } from "./ToastProvider";

type Friend = { id: string; name: string; username: string };

type Offspring = {
  id: string;
  name: string;
  color: string;
  dnaLevel: DogReputationLevel;
  createdAt: string;
};

type Incoming = {
  id: string;
  fromUser: { id: string; name: string; username: string };
};

export function PetBreedingPanel({ friends }: { friends: Friend[] }) {
  const toast = useToast();
  const [incoming, setIncoming] = useState<Incoming[]>([]);
  const [offspring, setOffspring] = useState<Offspring[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/pet/breed");
    const data = await res.json();
    if (res.ok) {
      setIncoming(data.incoming ?? []);
      setOffspring(data.offspring ?? []);
    }
  }, []);

  useAsyncEffect(load, [load]);

  async function requestBreed(friendUserId: string) {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/pet/breed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendUserId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg("Pedido de cruzamento enviado!");
      await load();
    } else setMsg(data.error ?? "Erro.");
  }

  async function respond(requestId: string, accept: boolean) {
    setLoading(true);
    const res = await fetch("/api/pet/breed", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, accept }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      for (const key of (data.newAchievements ?? []) as AchievementKey[]) {
        toast(formatAchievementToast(key), "achievement");
      }
      if (accept) setMsg("🧬 Filhotes nasceram! DNA Caramelo aplicado.");
      await load();
    } else setMsg(data.error ?? "Erro.");
  }

  return (
    <section className="bc-card bc-dna-panel p-5">
      <h2 className="font-bold text-bc-blue">🧬 DNA Caramelo</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Cruze seu pet com um amigo — filhote herda personalidades dominantes dos
        pais.
      </p>

      {incoming.length > 0 && (
        <ul className="mt-4 space-y-2">
          {incoming.map((r) => (
            <li
              key={r.id}
              className="bc-animate-in flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bc-caramel/25 bg-bc-caramel/5 px-3 py-2 text-sm"
            >
              <span>
                <strong>{r.fromUser.name}</strong> quer cruzar pets
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void respond(r.id, true)}
                  className="bc-btn-primary text-xs"
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void respond(r.id, false)}
                  className="bc-btn-ghost text-xs"
                >
                  Recusar
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {friends.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-bc-brown">Convidar amigo</p>
          <ul className="flex flex-wrap gap-2">
            {friends.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void requestBreed(f.id)}
                  className="bc-btn-secondary text-xs"
                >
                  🧬 {f.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {offspring.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-bc-brown">
            Seus filhotes ({offspring.length})
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {offspring.map((o, i) => {
              const breed = REPUTATION_BY_LEVEL[o.dnaLevel];
              return (
                <li
                  key={o.id}
                  className="bc-dna-offspring bc-animate-in-up flex items-center gap-3 rounded-xl border border-bc-blue/10 p-3"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: `${o.color}33` }}
                  >
                    {breed.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-bc-blue">
                      {o.name}
                    </p>
                    <p className="text-[10px] text-bc-brown">{breed.breed}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {msg && <p className="mt-3 text-xs text-bc-green">{msg}</p>}
    </section>
  );
}
