"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

export function PetDailyClaimBanner() {
  const [canClaim, setCanClaim] = useState(false);
  const [streak, setStreak] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/pet/daily");
    const data = await res.json();
    if (res.ok) {
      setCanClaim(Boolean(data.canClaim));
      setStreak(data.dailyStreak ?? 0);
    }
  }, []);

  useAsyncEffect(refresh, [refresh]);

  async function claim() {
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch("/api/pet/daily", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível resgatar.");
        return;
      }
      setDone(true);
      setCanClaim(false);
      setStreak(data.dailyStreak ?? streak);
      window.dispatchEvent(new CustomEvent("bc-pet-daily-claimed"));
    } catch {
      setError("Falha de rede.");
    } finally {
      setClaiming(false);
    }
  }

  if (!canClaim && !done) return null;

  if (done) {
    return (
      <div className="bc-daily-banner bc-daily-banner--ok bc-animate-in mb-4 p-3 text-center text-sm">
        <p className="font-semibold text-bc-green">
          🎁 Bônus diário resgatado! +25 moedas
        </p>
        {streak > 1 && (
          <p className="mt-1 text-xs text-bc-brown">
            Sequência: {streak} dia{streak !== 1 ? "s" : ""} 🔥
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bc-daily-banner bc-animate-in mb-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-bc-blue">🦴 Bônus diário do pet</p>
          <p className="mt-1 text-xs text-bc-brown">
            +25 moedas e +15 XP — resgate antes que o dia acabe!
            {streak > 0 && ` (sequência: ${streak})`}
          </p>
          {error && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => void claim()}
            disabled={claiming}
            className="bc-btn-primary px-4 py-2 text-sm"
          >
            {claiming ? "…" : "Resgatar"}
          </button>
          <Link href="/cachorro" className="bc-btn-ghost px-3 py-2 text-sm">
            Pet →
          </Link>
        </div>
      </div>
    </div>
  );
}
