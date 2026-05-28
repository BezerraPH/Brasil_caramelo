"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type StackHealth = {
  soketi?: { configured: boolean; label: string };
  livekit?: { configured: boolean; label: string };
  turn?: { configured: boolean; label: string };
  ollama?: { configured: boolean; label: string };
};

export function MatilhaServiceStatus() {
  const [stack, setStack] = useState<StackHealth | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/matilha/connection");
    const data = await res.json();
    if (res.ok && data.stack) setStack(data.stack);
  }, []);

  useAsyncEffect(load, [load]);

  if (!stack) return null;

  const items = [
    { key: "soketi", icon: "💬" },
    { key: "livekit", icon: "🎙️" },
    { key: "turn", icon: "📹" },
    { key: "redis", icon: "⚡" },
    { key: "meilisearch", icon: "🔍" },
    { key: "minio", icon: "📦" },
    { key: "ollama", icon: "🤖" },
  ] as const;

  return (
    <section className="bc-card bc-animate-in mb-8 p-4">
      <h2 className="text-sm font-bold text-bc-blue">Status da stack</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Serviços self-hosted detectados via configuração
      </p>
      <ul className="bc-service-status mt-3 flex flex-wrap gap-2">
        {items.map(({ key, icon }) => {
          const svc = stack[key];
          if (!svc) return null;
          const ok = svc.configured;
          return (
            <li
              key={key}
              className={`bc-service-pill ${ok ? "bc-service-pill--ok" : "bc-service-pill--off"}`}
              title={svc.label}
            >
              <span aria-hidden>{icon}</span>
              {svc.label}
              <span className="bc-service-pill-dot" aria-hidden />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
