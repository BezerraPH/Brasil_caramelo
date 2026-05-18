"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type Peer = {
  id: string;
  name: string;
  baseUrl: string;
  lastSyncAt: string | null;
};

export function FederationPanel() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/federation/peers");
    const data = await res.json();
    if (res.ok) setPeers(data.peers);
  }, []);

  useAsyncEffect(load, [load]);

  async function addPeer() {
    setMsg(null);
    const res = await fetch("/api/federation/peers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, baseUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      setSecret(data.peer.secret);
      setName("");
      setBaseUrl("");
      await load();
    } else setMsg(data.error);
  }

  async function syncAll() {
    setSyncing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/federation/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg(
          `Sincronizado com ${data.peers} peer(s). ${data.imported} recados de casinhas.`,
        );
        await load();
      } else setMsg(data.error);
    } finally {
      setSyncing(false);
    }
  }

  async function removePeer(id: string) {
    await fetch(`/api/federation/peers?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <section className="bc-card mt-6 p-5">
      <h2 className="font-bold text-bc-blue">🌐 Matilha LAN (Caramelo-Sync)</h2>
      <p className="mt-2 text-xs text-bc-brown">
        Conecte outro servidor Brasil Caramelo na rede local (ex.: casa de um
        amigo). Troca recados de casinhas via webhook assinado.
      </p>

      {secret && (
        <p className="mt-3 rounded-lg bg-bc-gold/10 p-3 text-xs text-bc-brown">
          Guarde o segredo do peer (mostrado uma vez):{" "}
          <code className="break-all font-mono">{secret}</code>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="bc-input flex-1"
          placeholder="Nome (ex: Casa do João)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="bc-input flex-1"
          placeholder="http://192.168.1.10:3000"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
        <button type="button" onClick={() => void addPeer()} className="bc-btn-secondary">
          Adicionar peer
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {peers.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bc-blue/10 px-3 py-2 text-sm"
          >
            <span>
              <strong>{p.name}</strong> — {p.baseUrl}
            </span>
            <button
              type="button"
              onClick={() => void removePeer(p.id)}
              className="text-xs text-bc-brown hover:text-red-600"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      {peers.length > 0 && (
        <button
          type="button"
          disabled={syncing}
          onClick={() => void syncAll()}
          className="bc-btn-primary mt-4 w-full sm:w-auto"
        >
          {syncing ? "Sincronizando…" : "Sincronizar peers"}
        </button>
      )}

      {msg && <p className="mt-3 text-xs text-bc-green">{msg}</p>}
    </section>
  );
}
