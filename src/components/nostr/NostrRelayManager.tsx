"use client";

import { useState, useEffect } from "react";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { DEFAULT_NOSTR_RELAYS, testRelayConnection } from "@/lib/nostr/relays";
import type { RelayInfo } from "@/lib/nostr/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SUGGESTED_RELAYS = [
  { url: "wss://relay.damus.io", label: "Damus Global" },
  { url: "wss://nos.lol", label: "Nos.lol Global" },
  { url: "wss://relay.nostr.band", label: "Nostr Band" },
  { url: "wss://nostr.mom", label: "Nostr Mom" },
  { url: "wss://nostr.oxtr.dev", label: "Oxtr Dev" },
];

export function NostrRelayManager({ isOpen, onClose }: Props) {
  const { relays, setRelays } = useNostrAuth();
  const [relayList, setRelayList] = useState<RelayInfo[]>([]);
  const [newRelayUrl, setNewRelayUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    Promise.all(relays.map((url) => testRelayConnection(url))).then((results) => {
      if (active) {
        setRelayList(results);
        setTesting(false);
      }
    });

    return () => {
      active = false;
    };
  }, [isOpen, relays]);

  if (!isOpen) return null;

  function handleAddRelay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let url = newRelayUrl.trim();
    if (!url) return;

    if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
      url = `wss://${url}`;
    }

    if (relays.includes(url)) {
      setError("Este relay já está na sua lista.");
      return;
    }

    const updated = [...relays, url];
    setRelays(updated);
    setNewRelayUrl("");
  }

  function handleAddSuggested(url: string) {
    setError(null);
    if (relays.includes(url)) {
      setError("Este relay já está na sua lista.");
      return;
    }
    setRelays([...relays, url]);
  }

  function handleRemoveRelay(urlToRemove: string) {
    if (relays.length <= 1) {
      setError("Você precisa ter pelo menos um relay configurado.");
      return;
    }
    const updated = relays.filter((r) => r !== urlToRemove);
    setRelays(updated);
  }

  function handleResetDefaults() {
    setRelays(DEFAULT_NOSTR_RELAYS);
    setError(null);
  }

  async function handleRefreshDiagnostics() {
    setTesting(true);
    const results = await Promise.all(relays.map((url) => testRelayConnection(url)));
    setRelayList(results);
    setTesting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bc-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-bc-caramel/30 bg-bc-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-bc-brown/60 hover:bg-black/5 hover:text-bc-brown"
          title="Fechar"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <span className="text-3xl">🌐</span>
          <div>
            <h2 className="text-xl font-black text-bc-blue">Gerenciador de Relays Nostr</h2>
            <p className="text-xs text-bc-brown/70">
              Servidores WebSockets descentralizados que armazenam e propagam suas notas
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Lista de Relays Configurados */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-bc-blue">
              Relays Ativos ({relays.length})
            </span>
            <button
              onClick={handleRefreshDiagnostics}
              disabled={testing}
              className="text-xs font-semibold text-bc-green hover:underline"
            >
              {testing ? "Testando latência…" : "↻ Testar Conexão"}
            </button>
          </div>

          <div className="space-y-2">
            {relays.map((url) => {
              const diag = relayList.find((r) => r.url === url);
              const isConnected = diag ? diag.state === "connected" : true;
              const latency = diag?.latencyMs;

              return (
                <div
                  key={url}
                  className="flex items-center justify-between rounded-2xl border border-bc-caramel/15 bg-bc-sand/20 p-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        isConnected ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-bc-brown truncate">{url}</p>
                      <p className="text-[10px] text-bc-brown/60">
                        {isConnected
                          ? `Conectado ${latency !== undefined ? `• ${latency}ms` : ""}`
                          : "Erro ao conectar via WebSocket"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveRelay(url)}
                    className="ml-2 shrink-0 rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-500/10"
                    title="Remover relay"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sugestões Rápidas */}
        <div className="mt-5 border-t border-bc-caramel/15 pt-3">
          <label className="bc-label">Relays Recomendados</label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {SUGGESTED_RELAYS.map((s) => (
              <button
                key={s.url}
                type="button"
                onClick={() => handleAddSuggested(s.url)}
                disabled={relays.includes(s.url)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  relays.includes(s.url)
                    ? "bg-black/5 text-bc-brown/40 cursor-not-allowed"
                    : "border border-bc-caramel/20 bg-bc-white text-bc-brown hover:bg-bc-caramel/10"
                }`}
              >
                + {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Adicionar Novo Relay */}
        <form onSubmit={handleAddRelay} className="mt-4">
          <label className="bc-label">Adicionar Relay Customizado</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="wss://meu-relay-canino.com"
              value={newRelayUrl}
              onChange={(e) => setNewRelayUrl(e.target.value)}
              className="bc-input flex-1 font-mono text-xs"
            />
            <button type="submit" className="bc-btn-primary px-4 py-2 text-xs font-bold">
              Adicionar
            </button>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-bc-caramel/15 pt-3 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-bc-brown/70 hover:text-bc-brown underline"
          >
            Restaurar Relays Padrão
          </button>
          <button onClick={onClose} className="bc-btn-secondary px-4 py-1.5 text-xs font-bold">
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
