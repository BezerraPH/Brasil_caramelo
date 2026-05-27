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

type SortKey = "default" | "members" | "newest";

const BANNER_COLORS = ["#C68642", "#2D8B57", "#C68642"] as const;

export function MatilhasForumList() {
  const [packs, setPacks] = useState<PackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("default");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sort !== "default") params.set("sort", sort);
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/packs?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setPacks(data.packs ?? []);
    setLoading(false);
  }, [sort, query]);

  useAsyncEffect(load, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["default", "Clássicas"],
            ["members", "Mais membros"],
            ["newest", "Mais novas"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              sort === key
                ? "bg-bc-caramel text-white"
                : "border border-bc-blue/20 text-bc-brown"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar Matilha…"
        className="bc-input w-full text-sm"
      />

      {loading ? (
        <p className="text-sm text-bc-brown animate-pulse">Carregando Matilhas…</p>
      ) : packs.length === 0 ? (
        <p className="text-sm text-bc-brown">Nenhuma Matilha encontrada.</p>
      ) : (
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
      )}
    </div>
  );
}
