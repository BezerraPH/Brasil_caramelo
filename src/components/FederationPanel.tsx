"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { FederationSyncButton } from "./FederationSyncButton";

type Peer = {
  id: string;
  name: string;
  baseUrl: string;
  networkType: string;
  lastSyncAt: string | null;
  lastProbeAt: string | null;
  lastProbeOk: boolean | null;
};

type NetworkTab = "lan" | "tailnet";

export function FederationPanel() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [tab, setTab] = useState<NetworkTab>("lan");
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [probing, setProbing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/federation/peers");
    const data = await res.json();
    if (res.ok) setPeers(data.peers);
  }, []);

  useAsyncEffect(load, [load]);

  const placeholder =
    tab === "tailnet"
      ? "https://servidor.tailXXXX.ts.net"
      : "http://192.168.1.10:3000";

  async function addPeer() {
    setMsg(null);
    const res = await fetch("/api/federation/peers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, baseUrl, networkType: tab }),
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

  async function probePeer(id: string) {
    setProbing(id);
    try {
      const res = await fetch(`/api/federation/peers/${id}/probe`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(
          data.ok
            ? `Peer online (${data.latencyMs}ms)${data.version ? ` · ${data.version}` : ""}`
            : `Peer offline: ${data.error ?? "sem resposta"}`,
        );
      }
      await load();
    } finally {
      setProbing(null);
    }
  }

  return (
    <section className="bc-card bc-federation-panel-v3 mt-6 p-5">
      <h2 className="font-bold text-bc-blue">🌐 Caramelo-Sync (LAN + Tailscale)</h2>
      <p className="mt-2 text-xs text-bc-brown">
        Conecte outros servidores Brasil Caramelo na rede local ou na tailnet
        (MagicDNS <code className="text-[10px]">*.ts.net</code>). Recados de
        casinhas via webhook assinado.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("lan")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            tab === "lan"
              ? "bg-bc-green text-white"
              : "border border-bc-blue/20 text-bc-blue"
          }`}
        >
          🏠 LAN
        </button>
        <button
          type="button"
          onClick={() => setTab("tailnet")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            tab === "tailnet"
              ? "bg-bc-blue text-white"
              : "border border-bc-blue/20 text-bc-blue"
          }`}
        >
          🔒 Tailscale
        </button>
      </div>

      {tab === "tailnet" && (
        <p className="bc-animate-in mt-3 rounded-lg bg-bc-blue/10 p-3 text-[10px] text-bc-brown">
          Use a URL HTTPS do <strong>tailscale serve</strong> do outro servidor.
          Ambos os lados precisam do mesmo segredo em{" "}
          <code>FEDERATION_EXPORT_SECRET</code> ou do segredo do peer.
        </p>
      )}

      {secret && (
        <p className="mt-3 rounded-lg bg-bc-gold/10 p-3 text-xs text-bc-brown bc-animate-in">
          Guarde o segredo do peer (mostrado uma vez):{" "}
          <code className="break-all font-mono">{secret}</code>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="bc-input flex-1"
          placeholder="Nome (ex: Servidor do João)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="bc-input flex-1"
          placeholder={placeholder}
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
            <span className="min-w-0 flex-1">
              <span
                className={`mr-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  p.networkType === "tailnet"
                    ? "bg-bc-blue/15 text-bc-blue"
                    : "bg-bc-green/15 text-bc-green"
                }`}
              >
                {p.networkType === "tailnet" ? "TS" : "LAN"}
              </span>
              <strong>{p.name}</strong>
              <span className="block truncate text-xs text-bc-brown">{p.baseUrl}</span>
              {p.lastSyncAt && (
                <span className="text-[10px] text-bc-brown">
                  sync {new Date(p.lastSyncAt).toLocaleString("pt-BR")}
                </span>
              )}
              {p.lastProbeAt != null && (
                <span
                  className={`ml-2 text-[10px] ${p.lastProbeOk ? "text-bc-green" : "text-red-600"}`}
                >
                  {p.lastProbeOk ? "● online" : "○ offline"}
                </span>
              )}
            </span>
            <span className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={probing === p.id}
                onClick={() => void probePeer(p.id)}
                className="text-xs text-bc-blue hover:underline"
              >
                {probing === p.id ? "…" : "Testar"}
              </button>
              <button
                type="button"
                onClick={() => void removePeer(p.id)}
                className="text-xs text-bc-brown hover:text-red-600"
              >
                Remover
              </button>
            </span>
          </li>
        ))}
      </ul>

      {peers.length > 0 && <FederationSyncButton className="mt-4" />}

      {msg && <p className="mt-3 text-xs text-bc-green">{msg}</p>}
    </section>
  );
}
