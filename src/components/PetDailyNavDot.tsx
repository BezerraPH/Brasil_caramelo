"use client";

import { useCallback, useEffect, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

/** Indicador na nav mobile quando o bônus diário do pet está disponível. */
export function PetDailyNavDot() {
  const [visible, setVisible] = useState(false);

  const check = useCallback(async () => {
    const res = await fetch("/api/pet/daily");
    const data = await res.json();
    if (res.ok && data.canClaim) setVisible(true);
  }, []);

  useAsyncEffect(check, [check]);

  useEffect(() => {
    const hide = () => setVisible(false);
    window.addEventListener("bc-pet-daily-claimed", hide);
    return () => window.removeEventListener("bc-pet-daily-claimed", hide);
  }, []);

  if (!visible) return null;

  return (
    <span
      className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-bc-gold shadow-sm shadow-bc-gold/50"
      aria-label="Bônus diário disponível"
    />
  );
}
