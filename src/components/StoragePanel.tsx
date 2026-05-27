"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type Stats = {
  ready: boolean;
  backend: "local" | "minio";
  bucket: string | null;
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

  const isMinio = stats.backend === "minio";

  return (
    <section className="bc-card bc-storage-panel bc-animate-in mb-6 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-semibold text-bc-blue">
          {isMinio ? "📦 Armazenamento MinIO" : "💾 Armazenamento local"}
        </h2>
        <span
          className={`bc-storage-badge rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            isMinio
              ? "bg-bc-caramel/20 text-bc-brown"
              : "bg-bc-green/15 text-bc-green"
          }`}
        >
          {isMinio ? "S3" : "Disco"}
        </span>
      </div>
      <p className="mt-1 text-xs text-bc-brown">
        {isMinio
          ? `Mídia no bucket ${stats.bucket ?? "bc-media"} — URLs continuam em /api/media/.`
          : "Fotos e vídeos no seu servidor — sem nuvem de terceiros."}
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
          {isMinio
            ? "MinIO indisponível. Verifique S3_* no .env e o container minio."
            : "Pasta indisponível. Verifique UPLOAD_DIR e permissões no servidor."}
        </p>
      )}
    </section>
  );
}
