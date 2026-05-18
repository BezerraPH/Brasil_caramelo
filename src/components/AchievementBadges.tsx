"use client";

import { useAsyncEffect } from "@/hooks/use-async-effect";
import { useCallback, useState } from "react";

type Badge = {
  key: string;
  title: string;
  emoji: string;
  desc: string;
  unlockedAt: string;
};

export function AchievementBadges({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/achievements?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (res.ok) setBadges(data.achievements ?? []);
  }, [userId]);

  useAsyncEffect(load, [load]);

  if (badges.length === 0) return null;

  return (
    <section className="bc-card bc-animate-in mt-4 p-4">
      <h2 className="mb-3 text-sm font-bold text-bc-blue">Conquistas</h2>
      <ul className="flex flex-wrap gap-2">
        {badges.map((b) => (
          <li
            key={b.key}
            title={b.desc}
            className="bc-badge-premium flex items-center gap-1 px-2.5 py-1"
          >
            <span>{b.emoji}</span>
            <span>{b.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
