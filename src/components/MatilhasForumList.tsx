"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type PackItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: number;
  threadCount: number;
  joined: boolean;
};

const BANNER_COLORS = ["#C68642", "#2D8B57", "#C68642"] as const;

export function MatilhasForumList() {
  const [packs, setPacks] = useState<PackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/packs");
    const data = await res.json();
    if (res.ok) setPacks(data.packs ?? []);
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  if (loading) {
    return <p className="text-sm text-bc-brown animate-pulse">Carregando Matilhas…</p>;
  }

  return (
    <ul className="space-y-4">
      {packs.map((pack, i) => (
        <li key={pack.id}>
          <Link
            href={`/matilhas/${pack.slug}`}
            className="bc-card block overflow-hidden transition hover:border-bc-caramel/50"
          >
            <div
              className="px-4 py-3 text-white"
              style={{ backgroundColor: BANNER_COLORS[i % BANNER_COLORS.length] }}
            >
              <h2 className="font-bold">{pack.name}</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-bc-brown">{pack.description}</p>
              <p className="mt-2 text-xs text-bc-green">
                {pack.memberCount} membro{pack.memberCount !== 1 ? "s" : ""} ·{" "}
                {pack.threadCount} tópico{pack.threadCount !== 1 ? "s" : ""}
                {pack.joined && " · você entrou"}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
