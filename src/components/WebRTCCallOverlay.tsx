"use client";

import { useEffect, useRef } from "react";
import {
  canUseMediaDevices,
  mediaDevicesBlockedReason,
} from "@/lib/media-devices";

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
  const mediaBlocked = mediaDevicesBlockedReason();

  useEffect(() => {
    void attachStream(localRef.current, remoteRef.current);
    const t = setInterval(() => {
      void attachStream(localRef.current, remoteRef.current);
    }, 2000);
    return () => clearInterval(t);
  }, [attachStream, status]);

  return (
    <div className="bc-call-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4 pb-28 bc-animate-in md:pb-4">
      <p className="bc-shimmer-text text-xl font-bold">
        {mode === "incoming" ? "📞 Chamada recebida" : "📹 Chamando"}
      </p>
      <p className="mt-1 text-lg text-white">{peerName}</p>
      <p className="bc-call-ring mt-2 max-w-sm rounded-full px-4 py-1 text-center text-sm text-white/70">
        {status}
      </p>

      {mediaBlocked && (
        <p className="mt-3 max-w-md rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-center text-xs text-amber-100">
          {mediaBlocked}
        </p>
      )}

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

      <div className="mt-6 flex w-full max-w-md flex-wrap justify-center gap-3">
        {mode === "incoming" && (
          <>
            <button
              type="button"
              onClick={onAccept}
              disabled={!canUseMediaDevices()}
              className="bc-btn-primary min-h-12 min-w-[140px] px-8 text-base"
            >
              Atender
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="bc-btn-secondary min-h-12 min-w-[120px] text-base"
            >
              Recusar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onHangup}
          className="min-h-12 min-w-[120px] rounded-xl bg-red-600 px-6 py-2.5 text-base font-semibold text-white shadow-lg transition hover:bg-red-700"
        >
          Desligar
        </button>
      </div>

      <p className="mt-6 max-w-md text-center text-xs text-white/40">
        Chamada P2P (STUN
        {process.env.NEXT_PUBLIC_TURN_URL ? " + TURN" : ""}). Celular em HTTP
        não atende sem HTTPS — veja CONFIGURACAO.md.
      </p>
    </div>
  );
}
