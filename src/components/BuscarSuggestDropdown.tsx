"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type Suggestion = {
  type: "tag";
  label: string;
  count: number;
  href: string;
};

export function BuscarSuggestDropdown({
  query,
  visible,
}: {
  query: string;
  visible: boolean;
}) {
  const [items, setItems] = useState<Suggestion[]>([]);

  const load = useCallback(async () => {
    if (!visible) {
      setItems([]);
      return;
    }
    const q = query.trim();
    const res = await fetch(
      `/api/search/suggest?q=${encodeURIComponent(q.replace(/^#/, ""))}`,
    );
    if (res.ok) {
      const data = await res.json();
      setItems(data.suggestions ?? []);
    }
  }, [query, visible]);

  useAsyncEffect(load, [load]);

  if (!visible || items.length === 0) return null;

  return (
    <ul className="bc-suggest-dropdown bc-animate-in absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-bc-blue/15 bg-bc-white shadow-lg">
      {items.map((s, i) => (
        <li key={s.label}>
          <Link
            href={s.href}
            className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition hover:bg-bc-green/10"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <span className="font-semibold text-bc-green">{s.label}</span>
            <span className="text-[10px] text-bc-brown">{s.count}×</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
