"use client";

import { useAsyncEffect } from "@/hooks/use-async-effect";
import { useCallback, useState } from "react";

export function UploadSetupBanner() {
  const [state, setState] = useState<{
    uploadReady: boolean;
    hint: string | null;
  } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/media/config");
    const data = await res.json();
    if (res.ok) {
      setState({ uploadReady: data.uploadReady, hint: data.hint });
    }
  }, []);

  useAsyncEffect(load, [load]);

  if (!state || state.uploadReady) return null;

  return (
    <div
      role="alert"
      className="bc-animate-in mb-4 rounded-2xl border-2 border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-bold">📷 Uploads desativados</p>
      <p className="mt-1 text-xs leading-relaxed">{state.hint}</p>
      <p className="mt-2 text-[10px] opacity-80">
        Dashboard:{" "}
        <a
          href="https://uploadthing.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          uploadthing.com/dashboard
        </a>{" "}
        → API Keys → copiar token SDK v7 → colar em{" "}
        <code className="rounded bg-amber-100 px-1">UPLOADTHING_TOKEN</code> →
        reiniciar o app.
      </p>
    </div>
  );
}
