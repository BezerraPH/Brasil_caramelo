"use client";

import { useState } from "react";
import { useCallOptional } from "@/components/CallProvider";
import {
  gatherIceCandidates,
  icePathLabel,
  type GatheredIceCandidate,
} from "@/lib/webrtc-ice-debug";

export function WebRTCDebugPanel() {
  const call = useCallOptional();
  const liveIcePath = call?.icePath ?? "idle";
  const [gathering, setGathering] = useState(false);
  const [candidates, setCandidates] = useState<GatheredIceCandidate[]>([]);
  const [expanded, setExpanded] = useState(false);

  const stun = process.env.NEXT_PUBLIC_STUN_URL?.trim();
  const turn = process.env.NEXT_PUBLIC_TURN_URL?.trim();

  async function runProbe() {
    setGathering(true);
    setCandidates([]);
    const list = await gatherIceCandidates();
    setCandidates(list);
    setGathering(false);
    setExpanded(true);
  }

  const hasRelay = candidates.some((c) => c.type === "relay");
  const hasHost = candidates.some((c) => c.type === "host" || c.type === "srflx");

  return (
    <section className="bc-card bc-webrtc-debug mb-6 p-5">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <h2 className="font-bold text-bc-blue">📡 WebRTC avançado</h2>
        <span className="text-xs text-bc-brown">{expanded ? "▲" : "▼"}</span>
      </button>
      <p className="mt-2 text-xs text-bc-brown">
        Indica se a chamada em /mensagens usa conexão direta (P2P) ou servidor TURN (relay).
      </p>

      {liveIcePath !== "idle" && (
        <p className={`mt-3 text-sm font-medium ${liveIcePath === "turn" ? "text-amber-800" : "text-bc-green"}`}>
          Chamada ativa: {icePathLabel(liveIcePath)}
        </p>
      )}

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-bc-blue/10 pt-4">
          <ul className="space-y-1 text-xs text-bc-brown">
            <li>
              STUN:{" "}
              {stun ? (
                <code className="text-[10px]">{stun}</code>
              ) : (
                <span className="text-amber-700">não configurado</span>
              )}
            </li>
            <li>
              TURN:{" "}
              {turn ? (
                <code className="text-[10px]">{turn}</code>
              ) : (
                <span className="text-amber-700">não configurado — 4G↔Wi‑Fi pode falhar</span>
              )}
            </li>
          </ul>

          <button
            type="button"
            disabled={gathering}
            onClick={() => void runProbe()}
            className="bc-btn-secondary w-full text-sm"
          >
            {gathering ? "Coletando candidatos ICE…" : "Testar candidatos ICE"}
          </button>

          {candidates.length > 0 && (
            <div className="rounded-xl bg-bc-blue/5 p-3">
              <p className="text-xs font-semibold text-bc-blue">
                {candidates.length} candidato(s) —{" "}
                {hasRelay ? "TURN disponível ✓" : "sem relay"}
                {hasHost ? " · P2P possível ✓" : ""}
              </p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-[10px] text-bc-brown">
                {candidates.map((c, i) => (
                  <li key={`${c.type}-${i}`}>
                    <span
                      className={
                        c.type === "relay"
                          ? "text-amber-800"
                          : c.type === "host"
                            ? "text-bc-green"
                            : ""
                      }
                    >
                      {c.type}
                    </span>{" "}
                    · {c.protocol} · {c.address}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
