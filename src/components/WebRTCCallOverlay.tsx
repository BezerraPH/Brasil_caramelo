"use client";

import { useEffect, useRef } from "react";

type WebRTCCallOverlayProps = {
  mode: "outgoing" | "incoming";
  peerName: string;
  status: string;
  onHangup: () => void;
  onAccept: () => void;
  onDecline: () => void;
  attachStream: (
    localEl: HTMLVideoElement | null,
    remoteEl: HTMLVideoElement | null,
  ) => Promise<void>;
};

export function WebRTCCallOverlay({
  mode,
  peerName,
  status,
  onHangup,
  onAccept,
  onDecline,
  attachStream,
}: WebRTCCallOverlayProps) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void attachStream(localRef.current, remoteRef.current);
    const t = setInterval(() => {
      void attachStream(localRef.current, remoteRef.current);
    }, 2000);
    return () => clearInterval(t);
  }, [attachStream, status]);

  return (
    <div className="bc-call-overlay fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/92 p-4 bc-animate-in">
      <p className="bc-shimmer-text text-xl font-bold">
        {mode === "incoming" ? "📞 Chamada recebida" : "📹 Chamando"}
      </p>
      <p className="mt-1 text-lg text-white">{peerName}</p>
      <p className="bc-call-ring mt-2 rounded-full px-4 py-1 text-sm text-white/70">
        {status}
      </p>

      <div className="bc-call-videos mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs text-white/50">Você</p>
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full rounded-xl bg-black object-cover ring-2 ring-bc-green/40"
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-white/50">Remoto</p>
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="aspect-video w-full rounded-xl bg-black object-cover"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {mode === "incoming" && (
          <>
            <button type="button" onClick={onAccept} className="bc-btn-primary px-8">
              Atender
            </button>
            <button type="button" onClick={onDecline} className="bc-btn-secondary">
              Recusar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onHangup}
          className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:bg-red-700"
        >
          Desligar
        </button>
      </div>

      <p className="mt-6 max-w-md text-center text-xs text-white/40">
        Vídeo P2P via WebRTC (STUN
        {process.env.NEXT_PUBLIC_TURN_URL ? " + TURN configurado" : ""}). Na
        mesma Wi‑Fi costuma funcionar; fora da rede configure TURN no .env.
      </p>
    </div>
  );
}
