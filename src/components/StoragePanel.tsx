"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type Stats = {
  ready: boolean;
  files: number;
  formatted: string;
};

export function StoragePanel() {
  const [stats, setStats] = useState<Stats | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/storage/stats");
    const data = await res.json();
    if (res.ok) setStats(data);
  }, []);

  useAsyncEffect(load, [load]);

  if (!stats) {
    return (
      <section className="bc-card mb-6 p-5">
        <div className="bc-skeleton h-20 rounded-xl" aria-hidden />
      </section>
    );
  }

  return (
    <section className="bc-card bc-animate-in mb-6 p-5">
      <h2 className="font-semibold text-bc-blue">💾 Armazenamento local</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Fotos e vídeos ficam no seu servidor — sem nuvem de terceiros.
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-bc-green/10 px-3 py-2">
          <dt className="text-[10px] uppercase text-bc-brown">Arquivos</dt>
          <dd className="font-bold text-bc-green">{stats.files}</dd>
        </div>
        <div className="rounded-lg bg-bc-blue/10 px-3 py-2">
          <dt className="text-[10px] uppercase text-bc-brown">Espaço usado</dt>
          <dd className="font-bold text-bc-blue">{stats.formatted}</dd>
        </div>
      </dl>
      {!stats.ready && (
        <p className="mt-2 text-xs text-amber-700">
          Pasta indisponível. Verifique UPLOAD_DIR e permissões no servidor.
        </p>
      )}
    </section>
  );
}
