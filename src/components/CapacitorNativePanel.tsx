"use client";

import { useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { isCapacitorNative } from "@/lib/capacitor-env";

export function CapacitorNativePanel() {
  const [native, setNative] = useState(false);
  const [ready, setReady] = useState(false);

  useAsyncEffect(() => {
    setNative(isCapacitorNative());
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <section className="bc-card bc-capacitor-panel bc-animate-in mb-6 p-5">
      <h2 className="font-bold text-bc-blue">📱 App nativo (Capacitor)</h2>
      {native ? (
        <p className="mt-2 text-sm text-bc-green">
          Você está no app nativo — conectado ao seu servidor Brasil Caramelo.
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs text-bc-brown">
            Gere APK/IPA que carregam seu servidor (ideal com Tailscale HTTPS).
            No PC: <code className="text-[10px]">./scripts/setup-capacitor.sh</code>
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-bc-brown">
            <li>Suba o app com Tailscale Serve (HTTPS)</li>
            <li>
              <code>CAPACITOR_SERVER_URL=https://seu-host.ts.net npm run cap:sync</code>
            </li>
            <li>
              <code>npm run cap:open:android</code> ou iOS no Mac
            </li>
          </ol>
        </>
      )}
    </section>
  );
}
