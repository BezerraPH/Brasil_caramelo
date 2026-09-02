"use client";

import { useState, useEffect } from "react";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { DEFAULT_NOSTR_RELAYS, testRelayConnection } from "@/lib/nostr/relays";
import type { RelayInfo } from "@/lib/nostr/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

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
          <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Adicionar Novo Relay */}
        <form onSubmit={handleAddRelay} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
            placeholder="wss://meu-relay-personalizado.com"
            className="flex-1 rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-bc-blue px-4 py-2 text-xs font-bold text-white hover:bg-bc-blue/90"
          >
            Adicionar
          </button>
        </form>

        {/* Lista de Relays */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-bc-brown">
            <span>Relays Conectados ({relays.length})</span>
            <button
              type="button"
              onClick={handleRefreshDiagnostics}
              disabled={testing}
              className="text-[11px] text-bc-blue hover:underline disabled:opacity-50"
            >
              {testing ? "Testando..." : "↻ Testar Conexão"}
            </button>
          </div>

          <div className="divide-y divide-bc-caramel/15 rounded-2xl border border-bc-caramel/20 bg-bc-cream/30">
            {relays.map((url) => {
              const diag = relayList.find((r) => r.url === url);
              const isConnected = diag?.state === "connected";
              const isError = diag?.state === "error";

              return (
                <div
                  key={url}
                  className="flex items-center justify-between p-3 text-xs transition-colors hover:bg-bc-white/60"
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        testing
                          ? "bg-amber-400 animate-pulse"
                          : isConnected
                          ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                          : isError
                          ? "bg-red-500"
                          : "bg-gray-400"
                      }`}
                      title={diag?.state || "Aguardando diagnóstico"}
                    />
                    <div className="truncate">
                      <p className="font-mono text-xs font-semibold text-bc-blue truncate">{url}</p>
                      {diag?.latencyMs !== undefined && (
                        <p className="text-[10px] text-bc-brown/60">{diag.latencyMs}ms latência</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRelay(url)}
                    className="shrink-0 rounded-lg p-1 text-xs text-bc-brown/40 hover:bg-red-500/10 hover:text-red-600"
                    title="Remover Relay"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé e Restauração */}
        <div className="mt-5 flex items-center justify-between border-t border-bc-caramel/15 pt-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-bc-brown/70 hover:text-bc-blue hover:underline"
          >
            Restaurar Relays Padrão
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-bc-green px-5 py-2 text-xs font-bold text-bc-white shadow-md hover:bg-bc-green-dark"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
