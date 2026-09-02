"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import type { CommunityCard } from "@/lib/communities-types";
import { COMMUNITY_CATEGORIES } from "@/lib/communities-types";

import { CreateCommunityModal } from "./CreateCommunityModal";

export function CommunitiesExplorer() {
  const [category, setCategory] = useState("todos");
  const [sort, setSort] = useState<"name" | "hot">("hot");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CommunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "todos") params.set("category", category);
    if (sort === "hot") params.set("sort", "hot");
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    const res = await fetch(`/api/communities${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    if (res.ok) setItems(data.communities ?? []);
    setLoading(false);
  }, [category, sort, query]);

  useAsyncEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="bc-community-toolbar mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold text-bc-brown">
            Buscar comunidade
          </span>
          <input
            type="search"
            className="bc-input bc-search-live w-full"
            placeholder="Nome ou assunto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSort("hot")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              sort === "hot"
                ? "bg-bc-caramel text-bc-brown shadow-md"
                : "border border-bc-blue/20 bg-bc-white text-bc-blue"
            }`}
          >
            🔥 Quentes
          </button>
          <button
            type="button"
            onClick={() => setSort("name")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              sort === "name"
                ? "bg-bc-green text-white shadow-md"
                : "border border-bc-blue/20 bg-bc-white text-bc-blue"
            }`}
          >
            A–Z
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="bc-btn-primary flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold shadow-md hover:scale-105 transition-all"
          >
            <span>➕</span>
            <span>Criar Comunidade</span>
          </button>
        </div>
      </div>

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
                <span className="bc-animate-float text-4xl">{c.emoji}</span>
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
          Nenhuma comunidade encontrada.
        </p>
      )}

      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => void load()}
      />
    </div>
  );
}
