"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const SUGGESTED_TAGS = [
  { label: "🐕 Pets & Cães", q: "cachorro" },
  { label: "🏠 Casinhas", q: "casinha" },
  { label: "🔥 #viralata", q: "#viralata" },
  { label: "🦴 #caramelo", q: "#caramelo" },
  { label: "⚡ Modo Livre", q: "nostr" },
];

export function ExplorarSearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/buscar");
      return;
    }
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
  }

  function handleTagClick(tag: string) {
    router.push(`/buscar?q=${encodeURIComponent(tag)}`);
  }

  return (
    <div className="mb-8 rounded-3xl border border-bc-caramel/25 bg-gradient-to-b from-bc-white via-bc-sand/30 to-bc-white p-6 shadow-sm text-center">
      <h1 className="text-2xl font-black text-bc-blue sm:text-3xl">
        Descobrir & Explorar a Matilha
      </h1>
      <p className="mt-1 text-sm font-semibold text-bc-brown">
        Encontre novos amigos, casinhas temáticas, pets e assuntos em alta no Brasil Caramelo
      </p>

      <form onSubmit={handleSearch} className="mx-auto mt-5 max-w-xl flex gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pessoas, @usuários, pets, casinhas ou #tags…"
            className="w-full rounded-2xl border-2 border-bc-caramel/30 bg-bc-white px-4 py-3 pl-11 text-sm font-medium text-bc-brown placeholder:text-bc-brown/50 focus:border-bc-green focus:outline-none focus:ring-2 focus:ring-bc-green/20"
            aria-label="Buscar na matilha"
          />
          <span className="pointer-events-none absolute left-3.5 top-3.5 text-base text-bc-brown/60">
            🔍
          </span>
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-gradient-to-r from-bc-green to-bc-caramel px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 active:scale-95"
        >
          Buscar
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <span className="font-bold text-bc-brown/70">Sugestões:</span>
        {SUGGESTED_TAGS.map((t) => (
          <button
            key={t.q}
            type="button"
            onClick={() => handleTagClick(t.q)}
            className="rounded-full border border-bc-caramel/20 bg-bc-white/80 px-2.5 py-1 text-xs font-semibold text-bc-brown hover:bg-bc-green/10 hover:text-bc-green transition"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
