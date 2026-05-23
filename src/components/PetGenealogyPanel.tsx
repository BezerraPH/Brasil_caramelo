"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { REPUTATION_BY_LEVEL } from "@/lib/constants";
import type { DogReputationLevel } from "@/generated/prisma/enums";

type GenealogyNode = {
  id: string;
  name: string;
  color: string;
  dnaLevel: DogReputationLevel;
  adoptedAt: string | null;
  role: "owner" | "parent";
  owner: { id: string; name: string; username: string };
  parentA: { id: string; name: string; username: string };
  parentB: { id: string; name: string; username: string };
};

type GenealogyStats = {
  asOwner: number;
  asParent: number;
  total: number;
};

export function PetGenealogyPanel() {
  const [nodes, setNodes] = useState<GenealogyNode[]>([]);
  const [stats, setStats] = useState<GenealogyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/pet/genealogy");
    if (res.ok) {
      const data = await res.json();
      setNodes(data.nodes ?? []);
      setStats(data.stats ?? null);
    }
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  if (loading) {
    return (
      <section className="bc-card bc-animate-pulse mt-6 p-5 text-center text-xs text-bc-brown">
        Carregando árvore genealógica…
      </section>
    );
  }

  if (nodes.length === 0) return null;

  return (
    <section className="bc-card bc-genealogy-panel bc-animate-in mt-6 p-5">
      <h2 className="font-bold text-bc-blue">🌳 Árvore da matilha</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Linhagem dos filhotes — avós, pais e donos virtuais.
      </p>
      {stats && (
        <p className="bc-genealogy-stats mt-2 text-[10px] font-semibold text-bc-caramel">
          {stats.asOwner} filhote(s) seu · participou de {stats.asParent}{" "}
          cruzamento(s) · {stats.total} na árvore
        </p>
      )}
      <ul className="mt-4 space-y-4">
        {nodes.map((node, i) => {
          const breed = REPUTATION_BY_LEVEL[node.dnaLevel];
          return (
            <li
              key={node.id}
              className="bc-genealogy-node bc-animate-in-up rounded-xl border border-bc-caramel/20 bg-gradient-to-br from-bc-caramel/5 to-bc-blue/5 p-4"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
                <ParentChip user={node.parentA} />
                <span className="text-bc-brown" aria-hidden>
                  ×
                </span>
                <ParentChip user={node.parentB} />
                <span className="text-bc-caramel" aria-hidden>
                  →
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                  style={{ backgroundColor: `${node.color}33` }}
                >
                  {breed.emoji}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-bc-blue">
                    {node.name}
                  </p>
                  <p className="text-[10px] text-bc-brown">
                    {breed.breed} · dono{" "}
                    <Link
                      href={`/perfil/${node.owner.username}`}
                      className="font-semibold text-bc-caramel hover:underline"
                    >
                      {node.owner.name}
                    </Link>
                  </p>
                </div>
              </div>
              {node.adoptedAt && (
                <p className="mt-2 text-[10px] text-bc-green">
                  ✓ DNA aplicado ao pet
                </p>
              )}
              {node.role === "parent" && (
                <p className="mt-1 text-[10px] text-bc-brown">
                  Você participou deste cruzamento como parente
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ParentChip({
  user,
}: {
  user: { id: string; name: string; username: string };
}) {
  return (
    <Link
      href={`/perfil/${user.username}`}
      className="rounded-full bg-bc-white/80 px-2.5 py-1 font-semibold text-bc-blue transition hover:bg-bc-blue/10"
    >
      {user.name}
    </Link>
  );
}
