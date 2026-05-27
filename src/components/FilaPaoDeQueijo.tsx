"use client";

import Link from "next/link";
import { useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "@/components/UserAvatar";

type Suggestion = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  sharedPacks: string[];
  mutualBestFriends?: number;
  queueScore?: number;
};

/** Fila do Pão de Queijo — sugestões por Matilhas em comum. */
export function FilaPaoDeQueijo() {
  const [count, setCount] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useAsyncEffect(() => {
    fetch("/api/matilha/friend-queue")
      .then((r) => r.json())
      .then((data) => {
        setCount(data.count ?? 0);
        setSuggestions(data.suggestions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (count === 0) return null;

  return (
    <section className="bc-sorte-dia-modern border-bc-caramel/40 from-[#FFF8F0] to-bc-caramel/15 p-4">
      <h2 className="text-sm font-bold text-bc-caramel">
        🧀 Fila do Pão de Queijo
      </h2>
      <p className="mt-1 text-sm text-bc-brown">
        <strong>{count}</strong> pessoa{count !== 1 ? "s" : ""} na sua Matilha
        {count !== 1 ? " querem" : " quer"} trocar uma ideia com você
      </p>
      <ul className="mt-3 space-y-2">
        {suggestions.slice(0, 4).map((s) => (
          <li key={s.id}>
            <Link
              href={`/perfil/${s.username}`}
              className="flex items-center gap-3 rounded-xl border border-bc-blue/10 bg-bc-white/80 p-2 transition hover:border-bc-caramel/40"
            >
              <UserAvatar name={s.name} avatarUrl={s.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-bc-blue">
                  {s.name}
                </p>
                <p className="truncate text-xs text-bc-brown">
                  {s.sharedPacks.slice(0, 2).join(" · ")}
                  {(s.mutualBestFriends ?? 0) > 0 && (
                    <span className="text-bc-caramel">
                      {" "}
                      · 💛 {s.mutualBestFriends} melhor
                      {s.mutualBestFriends !== 1 ? "es" : ""} amigo
                      {s.mutualBestFriends !== 1 ? "s" : ""} em comum
                    </span>
                  )}
                </p>
              </div>
              <span className="text-xs text-bc-caramel">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/matilhas"
        className="mt-3 inline-block text-xs font-medium text-bc-blue hover:underline"
      >
        Ver todas as Matilhas →
      </Link>
    </section>
  );
}
