"use client";

import { useState } from "react";
import { NostrPostCard } from "./NostrPostCard";
import type { NostrPost } from "@/lib/nostr/types";

const BOOKMARKS_STORAGE_KEY = "brasil_caramelo_nostr_bookmarks";

export function getSavedBookmarks(): NostrPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NostrPost[]) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(post: NostrPost): void {
  if (typeof window === "undefined") return;
  const current = getSavedBookmarks();
  if (!current.some((p) => p.id === post.id)) {
    const updated = [post, ...current];
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
  }
}

export function removeBookmark(postId: string): void {
  if (typeof window === "undefined") return;
  const current = getSavedBookmarks();
  const updated = current.filter((p) => p.id !== postId);
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
}

export function isPostBookmarked(postId: string): boolean {
  if (typeof window === "undefined") return false;
  const current = getSavedBookmarks();
  return current.some((p) => p.id === postId);
}

export function NostrBookmarks() {
  const [bookmarks, setBookmarks] = useState<NostrPost[]>(() => {
    if (typeof window === "undefined") return [];
    return getSavedBookmarks();
  });

  function handleRefresh() {
    setBookmarks(getSavedBookmarks());
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bc-card rounded-3xl border border-bc-caramel/20 bg-bc-white p-8 text-center shadow-xs">
        <p className="text-3xl">🔖</p>
        <p className="mt-2 text-sm font-bold text-bc-blue">Nenhuma nota salva ainda.</p>
        <p className="mt-1 text-xs text-bc-brown/70">
          Clique no botão de marcador (🔖 Salvar) em qualquer nota do feed para guardá-la aqui!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1 text-xs font-bold text-bc-brown">
        <span>Notas Salvas ({bookmarks.length})</span>
        <button
          onClick={() => {
            if (confirm("Deseja limpar todos os favoritos salvos?")) {
              localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
              setBookmarks([]);
            }
          }}
          className="text-red-500 hover:underline text-[11px]"
        >
          Limpar Salvos
        </button>
      </div>

      <div className="space-y-3.5">
        {bookmarks.map((post) => (
          <NostrPostCard
            key={post.id}
            post={post}
            onReaction={handleRefresh}
          />
        ))}
      </div>
    </div>
  );
}
