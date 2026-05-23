"use client";

import {
  clearSearchHistory,
  loadSearchHistory,
  pushSearchHistory,
} from "@/lib/search-history";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type Props = {
  onPick: (query: string) => void;
  refreshKey?: number;
};

export function BuscarRecentChips({ onPick, refreshKey = 0 }: Props) {
  const [items, setItems] = useState<string[]>([]);

  const load = useCallback(() => {
    setItems(loadSearchHistory());
  }, []);

  useAsyncEffect(load, [load, refreshKey]);

  if (items.length === 0) return null;

  return (
    <section className="bc-search-recent bc-animate-in mb-4">
      <SearchRecentHeader
        onClear={() => {
          clearSearchHistory();
          load();
        }}
      />
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              className="bc-search-recent-chip rounded-full border border-bc-blue/15 bg-bc-white px-3 py-1 text-xs font-medium text-bc-blue transition hover:border-bc-caramel hover:bg-bc-caramel/10"
            >
              {q.startsWith("#") ? q : q.length > 24 ? `${q.slice(0, 22)}…` : q}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchRecentHeader({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-bc-brown">
        Buscas recentes
      </p>
      <button type="button" onClick={onClear} className="bc-btn-ghost text-[10px]">
        Limpar
      </button>
    </div>
  );
}

export function rememberSearchQuery(query: string): void {
  pushSearchHistory(query);
}
