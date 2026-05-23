"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function MatilhaSearchStrip() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      router.push("/buscar");
      return;
    }
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={submit}
      className="bc-search-strip bc-animate-in mb-6 flex gap-2"
      role="search"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar pessoas, recados ou #tags…"
        className="bc-input min-w-0 flex-1"
        aria-label="Buscar na matilha"
      />
      <button type="submit" className="bc-btn-primary shrink-0 px-4">
        🔍
      </button>
    </form>
  );
}
