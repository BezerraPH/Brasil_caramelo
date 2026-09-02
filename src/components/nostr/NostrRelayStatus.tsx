"use client";

import { useEffect, useState } from "react";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { testRelayConnection, DEFAULT_NOSTR_RELAYS } from "@/lib/nostr/relays";
import type { RelayInfo } from "@/lib/nostr/types";

export function NostrRelayStatus() {
  const { relays, setRelays } = useNostrAuth();
  const [relayStatuses, setRelayStatuses] = useState<RelayInfo[]>(() =>
    relays.map((url) => ({
      url,
      read: true,
      write: true,
      state: "connected" as const,
      latencyMs: 45,
    }))
  );
  const [isOpen, setIsOpen] = useState(false);
  const [newRelayInput, setNewRelayInput] = useState("");
  const [testing, setTesting] = useState(false);

  async function checkRelays(relayUrls: string[]) {
    setTesting(true);
    try {
      const results = await Promise.all(relayUrls.map((url) => testRelayConnection(url)));
      setRelayStatuses(results);
    } catch {
      // ignore
    } finally {
      setTesting(false);
    }
  }

  // Testa relays sob demanda ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      checkRelays(relays);
    }
  }, [isOpen, relays]);

  const connectedCount = relayStatuses.filter((r) => r.state === "connected").length;

  function handleAddRelay(e: React.FormEvent) {
    e.preventDefault();
    const url = newRelayInput.trim();
    if (!url || (!url.startsWith("wss://") && !url.startsWith("ws://"))) return;
    if (!relays.includes(url)) {
      const updated = [...relays, url];
      setRelays(updated);
      setNewRelayInput("");
      checkRelays(updated);
    }
  }

  function handleRemoveRelay(url: string) {
    const updated = relays.filter((r) => r !== url);
    setRelays(updated);
    checkRelays(updated);
  }

  function handleResetRelays() {
    setRelays(DEFAULT_NOSTR_RELAYS);
    checkRelays(DEFAULT_NOSTR_RELAYS);
  }

  return (
    <div className="relative inline-block text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bc-badge flex items-center gap-1.5 border border-bc-caramel/30 bg-bc-white/80 px-2.5 py-1 text-bc-brown shadow-sm transition-all hover:border-bc-caramel hover:bg-bc-white"
        title="Status dos Relays Nostr"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            connectedCount > 0 ? "animate-pulse bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span className="font-bold text-bc-blue">⚡ Nostr</span>
        <span>
          {connectedCount}/{relays.length}
        </span>
      </button>

      {isOpen && (
        <div className="bc-card bc-glass absolute right-0 top-8 z-50 w-72 rounded-xl border border-bc-caramel/30 bg-bc-white p-3 shadow-xl sm:w-80">
          <div className="flex items-center justify-between border-b border-bc-caramel/20 pb-2">
            <h3 className="font-bold text-bc-blue">Relays Conectados ({connectedCount})</h3>
            <button
              onClick={() => checkRelays(relays)}
              disabled={testing}
              className="text-xs font-bold text-bc-green hover:underline"
            >
              {testing ? "Testando…" : "↻ Testar"}
            </button>
          </div>

          <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
            {relays.map((url) => {
              const status = relayStatuses.find((s) => s.url === url);
              const isConnected = status?.state === "connected";
              return (
                <div
                  key={url}
                  className="flex items-center justify-between rounded-lg border border-bc-caramel/15 bg-bc-white/60 p-1.5 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isConnected ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    />
                    <span className="truncate font-mono text-bc-blue/90">{url.replace("wss://", "")}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {status?.latencyMs && (
                      <span className="text-[10px] text-bc-brown/60">{status.latencyMs}ms</span>
                    )}
                    <button
                      onClick={() => handleRemoveRelay(url)}
                      className="text-red-400 hover:text-red-600 px-1"
                      title="Remover relay"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddRelay} className="mt-3 flex gap-1.5">
            <input
              type="text"
              placeholder="wss://seu-relay.com"
              value={newRelayInput}
              onChange={(e) => setNewRelayInput(e.target.value)}
              className="bc-input flex-1 py-1 text-xs"
            />
            <button
              type="submit"
              className="bc-btn-primary px-2.5 py-1 text-xs font-bold"
            >
              +
            </button>
          </form>

          <div className="mt-2 flex justify-between border-t border-bc-caramel/20 pt-2 text-[10px]">
            <button
              onClick={handleResetRelays}
              className="text-bc-brown/70 hover:text-bc-brown underline"
            >
              Restaurar padrões
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-bc-blue font-bold hover:underline"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
