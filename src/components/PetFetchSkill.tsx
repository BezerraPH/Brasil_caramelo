"use client";

import Link from "next/link";
import { feedPostPath } from "@/lib/feed-post-link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type FetchReward =
  | { type: "memory"; postId: string; preview: string; authorName: string }
  | { type: "coins"; coins: number }
  | { type: "xp"; xp: number };

export function PetFetchSkill({ onDone }: { onDone?: () => void }) {
  const [canFetch, setCanFetch] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState<FetchReward | null>(null);

  const check = useCallback(async () => {
    const res = await fetch("/api/pet/fetch");
    const data = await res.json();
    if (res.ok) setCanFetch(data.canFetch);
  }, []);

  useAsyncEffect(check, [check]);

  async function fetchSkill() {
    setLoading(true);
    setReward(null);
    try {
      const res = await fetch("/api/pet/fetch", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setReward(data.reward);
        setCanFetch(false);
        onDone?.();
      }
    } finally {
      setLoading(false);
    }
  }

  if (canFetch === null) return null;

  return (
    <div className="bc-card border-bc-green/30 bg-gradient-to-r from-bc-green/5 to-bc-blue/5 p-4">
      <p className="font-semibold text-bc-blue">🦴 Buscar na matilha</p>
      <p className="mt-1 text-xs text-bc-brown">
        Uma vez por dia seu pet pode trazer memórias, moedas ou XP.
      </p>
      {reward && (
        <div className="mt-3 rounded-lg bg-bc-white/80 p-3 text-sm text-bc-brown">
          {reward.type === "memory" && (
            <>
              <p className="font-medium text-bc-blue">
                Recado antigo de {reward.authorName}
              </p>
              <p className="mt-1 italic">&ldquo;{reward.preview}&rdquo;</p>
              <Link
                href={feedPostPath(reward.postId)}
                className="mt-2 inline-block text-xs font-semibold text-bc-caramel"
              >
                Ver no feed →
              </Link>
            </>
          )}
          {reward.type === "coins" && (
            <p>Encontrou 🪙 {reward.coins} CarameloCoins!</p>
          )}
          {reward.type === "xp" && <p>Ganhou ⭐ {reward.xp} XP de passeio!</p>}
        </div>
      )}
      <button
        type="button"
        disabled={!canFetch || loading}
        onClick={() => void fetchSkill()}
        className="bc-btn-secondary mt-3 w-full text-sm"
      >
        {loading
          ? "Farejando…"
          : canFetch
            ? "Mandar buscar"
            : "Volta amanhã"}
      </button>
    </div>
  );
}
