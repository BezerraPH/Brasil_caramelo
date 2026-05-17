"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

export function PetDailyBonus({ onClaimed }: { onClaimed?: () => void }) {
  const [canClaim, setCanClaim] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const check = useCallback(async () => {
    const res = await fetch("/api/pet/daily");
    const data = await res.json();
    if (res.ok) setCanClaim(data.canClaim);
  }, []);

  useAsyncEffect(check, [check]);

  async function claim() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pet/daily", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCanClaim(false);
        setMessage(`+${data.reward.coins} moedas e +${data.reward.xp} XP!`);
        onClaimed?.();
      } else {
        setMessage(data.error ?? "Não foi possível resgatar.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (canClaim === null) return null;

  return (
    <div className="bc-card border-bc-gold/30 bg-gradient-to-r from-bc-gold/10 to-bc-caramel/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-bc-blue">🎁 Missão diária</p>
          <p className="text-xs text-bc-brown">
            {canClaim
              ? "Resgate moedas e XP uma vez por dia."
              : "Você já resgatou hoje. Volte amanhã!"}
          </p>
        </div>
        {canClaim && (
          <button
            type="button"
            onClick={claim}
            disabled={loading}
            className="bc-btn-gold"
          >
            {loading ? "Resgatando…" : "Resgatar"}
          </button>
        )}
      </div>
      {message && (
        <p className="mt-2 text-xs font-medium text-bc-green">{message}</p>
      )}
    </div>
  );
}
