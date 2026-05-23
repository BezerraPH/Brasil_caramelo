"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { FederationSyncButton } from "./FederationSyncButton";

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
        <p className="mt-3 rounded-lg bg-bc-gold/10 p-3 text-xs text-bc-brown bc-animate-in">
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
            className="bc-federation-peer flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bc-blue/10 px-3 py-2 text-sm"
          >
            <span>
              <strong>{p.name}</strong> — {p.baseUrl}
              {p.lastSyncAt && (
                <span className="ml-2 text-[10px] text-bc-brown">
                  sync {new Date(p.lastSyncAt).toLocaleString("pt-BR")}
                </span>
              )}
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
        <FederationSyncButton className="mt-4" />
      )}

      {msg && <p className="mt-3 text-xs text-bc-green">{msg}</p>}
    </section>
  );
}
