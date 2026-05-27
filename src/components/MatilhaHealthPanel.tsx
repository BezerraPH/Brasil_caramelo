"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import type { StackHealthSnapshot } from "@/lib/stack-health";

type Health = {
  ok: boolean;
  database: string;
  storage: string;
  version: string;
  stage: string;
  stack?: StackHealthSnapshot;
};

export function MatilhaHealthPanel() {
  const [health, setHealth] = useState<Health | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/health");
    const data = await res.json();
    if (res.ok) setHealth(data as Health);
    else
      setHealth({
        ok: false,
        database: "?",
        storage: "?",
        version: "?",
        stage: "?",
      });
  }, []);

  useAsyncEffect(load, [load]);

  if (!health) {
    return (
      <section className="bc-card bc-animate-pulse p-4 text-center text-xs text-bc-brown">
        Verificando saúde da matilha…
      </section>
    );
  }

  const core = [
    { label: "Banco", ok: health.database === "connected" },
    { label: "Uploads", ok: health.storage === "ready" },
    { label: "App", ok: health.ok },
  ];

  const stack = health.stack
    ? [
        health.stack.soketi,
        health.stack.redis,
        health.stack.meilisearch,
        health.stack.minio,
        health.stack.livekit,
        health.stack.turn,
        health.stack.ollama,
      ]
    : [];

  return (
    <section className="bc-card bc-health-panel bc-animate-in p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-bc-blue">💚 Saúde do servidor</h2>
        <span className="text-[10px] text-bc-brown">
          {health.version} · {health.stage}
        </span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {core.map((item) => (
          <li
            key={item.label}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
              item.ok
                ? "bg-bc-green/15 text-bc-green"
                : "bg-red-500/10 text-red-700"
            }`}
          >
            {item.ok ? "✓" : "✗"} {item.label}
          </li>
        ))}
      </ul>
      {stack.length > 0 && (
        <>
          <p className="mt-3 text-[10px] font-semibold text-bc-brown">
            Stack self-hosted
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {stack.map((svc) => (
              <li
                key={svc.label}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  svc.configured
                    ? "bg-bc-blue/10 text-bc-blue"
                    : "bg-bc-brown/10 text-bc-brown"
                }`}
                title={
                  svc.configured
                    ? "Variáveis configuradas"
                    : "Não configurado no .env"
                }
              >
                {svc.configured ? "●" : "○"} {svc.label}
              </li>
            ))}
          </ul>
        </>
      )}
      <button
        type="button"
        onClick={() => void load()}
        className="bc-btn-ghost mt-3 text-[10px]"
      >
        Atualizar
      </button>
    </section>
  );
}
