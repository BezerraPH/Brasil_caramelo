"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import type { CommunityCard } from "@/lib/communities-types";
import { COMMUNITY_CATEGORIES } from "@/lib/communities-types";

export function CommunitiesExplorer() {
  const [category, setCategory] = useState("todos");
  const [items, setItems] = useState<CommunityCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const q = category !== "todos" ? `?category=${category}` : "";
    const res = await fetch(`/api/communities${q}`);
    const data = await res.json();
    if (res.ok) setItems(data.communities ?? []);
    setLoading(false);
  }, [category]);

  useAsyncEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {COMMUNITY_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              category === c.id
                ? "bg-bc-green text-white shadow-md"
                : "border border-bc-blue/20 bg-bc-white text-bc-blue hover:bg-bc-green/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bc-skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="bc-community-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <Link
              key={c.id}
              href={`/comunidades/${c.slug}`}
              className="bc-community-card bc-card-interactive bc-animate-in-up overflow-hidden p-0"
              style={
                {
                  "--bc-community-primary": c.themePrimary,
                  "--bc-community-accent": c.themeAccent,
                  animationDelay: `${i * 0.05}s`,
                } as CSSProperties
              }
            >
              <div
                className="bc-community-card-header px-4 py-5"
                style={{
                  background: `linear-gradient(135deg, ${c.themePrimary}22, ${c.themeAccent}33)`,
                }}
              >
                <span className="text-4xl">{c.emoji}</span>
                {c.isMember && (
                  <span className="bc-community-member-badge float-right rounded-full bg-bc-green/20 px-2 py-0.5 text-[10px] font-bold text-bc-green">
                    Membro
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-bc-blue">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-bc-brown">
                  {c.description}
                </p>
                <p className="mt-2 text-[10px] text-bc-brown/80">
                  {c.memberCount} participante
                  {c.memberCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="text-center text-sm text-bc-brown">
          Nenhuma comunidade nesta categoria.
        </p>
      )}
    </div>
  );
}
