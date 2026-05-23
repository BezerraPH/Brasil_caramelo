"use client";

import { useCallback, useEffect, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "./UserAvatar";

type Battle = {
  id: string;
  votesChallenger: number;
  votesOpponent: number;
  endsAt: string;
  challenger: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  opponent: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

type Friend = { id: string; name: string; username: string };

export function BattleArena({
  currentUserId,
  friends,
}: {
  currentUserId: string;
  friends: Friend[];
}) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/battles");
    const data = await res.json();
    if (res.ok) setBattles(data.battles);
  }, []);

  useAsyncEffect(load, [load]);

  useEffect(() => {
    const t = setInterval(() => void load(), 8000);
    return () => clearInterval(t);
  }, [load]);

  async function challenge(opponentId: string) {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opponentId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessage("Desafio enviado!");
      load();
    } else setMessage(data.error ?? "Erro.");
  }

  async function vote(battleId: string, forChallenger: boolean) {
    const res = await fetch("/api/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ battleId, forChallenger }),
    });
    if (res.ok) load();
    else {
      const data = await res.json();
      setMessage(data.error);
    }
  }

  return (
    <div className="space-y-6">
      <section className="bc-card p-5">
        <h2 className="font-bold text-bc-blue">Desafiar amigo</h2>
        <p className="mb-3 text-xs text-bc-brown">
          Batalha de fofura — 10 min de votação da matilha
        </p>
        {friends.length === 0 ? (
          <p className="text-sm text-bc-brown">Adicione amigos em /amigos</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {friends.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => challenge(f.id)}
                  className="bc-btn-secondary text-xs"
                >
                  ⚔️ {f.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {message && (
          <p className="mt-2 text-xs font-medium text-bc-green">{message}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="bc-battle-live-title font-bold text-bc-blue">
          ⚔️ Batalhas ao vivo
        </h2>
        {battles.length === 0 ? (
          <p className="bc-card bc-animate-in p-8 text-center text-bc-brown">
            Nenhuma batalha agora. Desafie alguém!
          </p>
        ) : (
          battles.map((b, i) => {
            const isParticipant =
              b.challenger.id === currentUserId ||
              b.opponent.id === currentUserId;
            const total = b.votesChallenger + b.votesOpponent || 1;
            return (
              <article
                key={b.id}
                className="bc-battle-card bc-card bc-animate-in-up overflow-hidden p-0"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="relative grid grid-cols-2 divide-x divide-bc-blue/10">
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bc-caramel/30 bg-bc-white px-2.5 py-0.5 text-xs font-bold text-bc-caramel shadow-sm"
                    aria-hidden
                  >
                    VS
                  </span>
                  <div className="p-4 text-center">
                    <UserAvatar
                      name={b.challenger.name}
                      avatarUrl={b.challenger.avatarUrl}
                    />
                    <p className="mt-2 text-sm font-semibold">{b.challenger.name}</p>
                    <p className="text-2xl font-bold text-bc-green">
                      {b.votesChallenger}
                    </p>
                    <div
                      className="bc-battle-bar mx-auto mt-2 h-2 max-w-[120px] overflow-hidden rounded-full bg-bc-blue/10"
                    >
                      <div
                        className="bc-battle-bar-fill h-full rounded-full bg-bc-green transition-all duration-500"
                        style={{
                          width: `${(b.votesChallenger / total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <UserAvatar
                      name={b.opponent.name}
                      avatarUrl={b.opponent.avatarUrl}
                    />
                    <p className="mt-2 text-sm font-semibold">{b.opponent.name}</p>
                    <p className="text-2xl font-bold text-bc-caramel">
                      {b.votesOpponent}
                    </p>
                    <div className="bc-battle-bar mx-auto mt-2 h-2 max-w-[120px] overflow-hidden rounded-full bg-bc-blue/10">
                      <div
                        className="bc-battle-bar-fill h-full rounded-full bg-bc-caramel transition-all duration-500"
                        style={{
                          width: `${(b.votesOpponent / total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isParticipant && (
                  <div className="flex gap-2 border-t border-bc-blue/10 p-3">
                    <button
                      type="button"
                      onClick={() => vote(b.id, true)}
                      className="bc-btn-primary flex-1 text-xs"
                    >
                      🐕 Mais fofo: {b.challenger.name.split(" ")[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => vote(b.id, false)}
                      className="bc-btn-secondary flex-1 text-xs"
                    >
                      🐕 {b.opponent.name.split(" ")[0]}
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
