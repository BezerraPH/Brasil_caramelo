"use client";

import { useEffect } from "react";

type ProfileVisitTrackerProps = {
  visitedId: string;
  enabled: boolean;
};

/** Registra visita em background (reciprocidade: só se showVisits ativo). */
export function ProfileVisitTracker({ visitedId, enabled }: ProfileVisitTrackerProps) {
  useEffect(() => {
    if (!enabled) return;
    void fetch("/api/profile-visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitedId }),
    });
  }, [visitedId, enabled]);

  return null;
}
