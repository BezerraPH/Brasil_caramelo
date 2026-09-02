"use client";

import { useState } from "react";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { shortenNpub } from "@/lib/nostr/keys";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function NostrAuthModal({ isOpen, onClose }: Props) {
  const { identity, loginWithExtension, loginWithKey, createGuestOrNewAccount, logout } =
    useNostrAuth();
  const [nsecInput, setNsecInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreated, setNewlyCreated] = useState<{ npub: string; nsec?: string } | null>(null);

  if (!isOpen) return null;

  async function handleExtensionLogin() {
    setLoading(true);
    setError(null);
    try {
      const ok = await loginWithExtension();
      if (!ok) {
        setError(
          "Extensão Nostr não detectada. Instale a extensão Alby ou nos2x no seu navegador.",
        );
      } else {
        onClose();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao conectar com extensão.");
    } finally {
      setLoading(false);
    }
  }

  async function handleKeyLogin() {
    if (!nsecInput.trim()) {
      setError("Insira sua chave nsec1... ou npub1...");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ok = await loginWithKey(nsecInput.trim());
      if (!ok) {
        setError("Chave inválida. Verifique se o formato começa com nsec1... ou npub1...");
      } else {
        setNsecInput("");
        onClose();
      }
    } catch {
      setError("Falha ao autenticar com a chave informada.");
    } finally {
      setLoading(false);
    }
  }

  function handleCreateNewAccount() {
    const newId = createGuestOrNewAccount();
    setNewlyCreated({ npub: newId.npub, nsec: newId.nsec });
  }

  async function copyToClipboard(text: string, type: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bc-card bc-glass w-full max-w-md rounded-2xl border border-bc-caramel/30 bg-bc-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-bc-caramel/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-lg font-bold text-bc-blue">Identidade Nostr</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-bc-brown hover:bg-bc-caramel/15"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-2.5 text-xs text-red-600">
            {error}
          </div>
        )}

        {identity ? (
          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-xl border border-bc-green/30 bg-bc-green/10 p-3">
              <p className="font-bold text-bc-green">Conectado ao Nostr 🐾</p>
              <p className="mt-1 font-mono text-xs text-bc-brown break-all">
                {shortenNpub(identity.npub, 12)}
              </p>
              <p className="mt-1 text-xs text-bc-brown">
                Modo: <span className="font-bold uppercase">{identity.mode}</span>
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard(identity.npub, "npub")}
                className="bc-btn-secondary w-full py-2 text-xs"
              >
                {copiedKey === "npub" ? "✓ Npub Copiado!" : "Copiar Chave Pública (Npub)"}
              </button>

              {identity.nsec && (
                <button
                  onClick={() => copyToClipboard(identity.nsec!, "nsec")}
                  className="bc-btn-secondary w-full py-2 text-xs"
                >
                  {copiedKey === "nsec"
                    ? "✓ Nsec Copiado!"
                    : "Copiar Chave Privada (Nsec - Guarde em segredo!)"}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const data = {
                    client: "Brasil Caramelo Nostr",
                    npub: identity.npub,
                    nsec: identity.nsec ?? "gerenciado por extensao",
                    pubkey: identity.pubkey,
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `brasil-caramelo-nostr-${identity.npub.slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-xl border border-bc-caramel/30 bg-bc-cream/40 w-full py-2 text-xs font-semibold text-bc-brown hover:bg-bc-cream transition-colors"
              >
                💾 Baixar Backup de Segurança (.json)
              </button>
            </div>

            <button
              onClick={() => {
                logout();
                setNewlyCreated(null);
              }}
              className="w-full rounded-xl border border-red-500/30 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10"
            >
              Desconectar Identidade Nostr
            </button>
          </div>
        ) : newlyCreated ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-bc-gold/40 bg-bc-gold/10 p-3 text-xs text-bc-brown">
              <p className="font-bold text-bc-blue">Nova Matilha Nostr Criada! 🐕</p>
              <p className="mt-1">
                Copie e guarde sua chave privada (<code className="font-bold text-red-600">nsec</code>
                ). Ela é a única forma de recuperar sua conta descentralizada.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-bc-blue">Chave Pública (npub):</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={newlyCreated.npub}
                  className="bc-input flex-1 font-mono text-xs"
                />
                <button
                  onClick={() => copyToClipboard(newlyCreated.npub, "new_npub")}
                  className="bc-btn-secondary px-3 py-1 text-xs"
                >
                  {copiedKey === "new_npub" ? "✓" : "Copiar"}
                </button>
              </div>
            </div>

            {newlyCreated.nsec && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-red-600">
                  Chave Privada (nsec - Não compartilhe):
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    type="password"
                    value={newlyCreated.nsec}
                    className="bc-input flex-1 font-mono text-xs"
                  />
                  <button
                    onClick={() => copyToClipboard(newlyCreated.nsec!, "new_nsec")}
                    className="bc-btn-primary px-3 py-1 text-xs"
                  >
                    {copiedKey === "new_nsec" ? "✓" : "Copiar"}
                  </button>
                </div>
              </div>
            )}

            <button onClick={onClose} className="bc-btn-primary mt-2 w-full py-2.5 text-xs">
              Pronto, começar a latir no Nostr!
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <button
              onClick={handleExtensionLogin}
              disabled={loading}
              className="bc-btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm shadow-md"
            >
              <span>⚡</span>
              <span>Conectar com Extensão (Alby / NIP-07)</span>
            </button>

            {typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost" && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-900 leading-relaxed">
                💡 <strong>Dica de Navegador (HTTP):</strong> Extensões de carteira (Alby/nos2x) exigem HTTPS para conectar. Em IP local HTTP, utilize <strong>Entrar com Chave</strong> ou gere uma nova conta abaixo com 1 clique!
              </div>
            )}

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-bc-caramel/20" />
              <span className="bg-bc-white px-2 text-xs text-bc-brown">ou com chave privada</span>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                placeholder="nsec1... ou npub1..."
                value={nsecInput}
                onChange={(e) => setNsecInput(e.target.value)}
                className="bc-input w-full font-mono text-xs"
              />
              <button
                onClick={handleKeyLogin}
                disabled={loading}
                className="bc-btn-secondary w-full py-2 text-xs font-bold"
              >
                Entrar com Chave
              </button>
            </div>

            <div className="border-t border-bc-caramel/20 pt-3 text-center">
              <button
                onClick={handleCreateNewAccount}
                className="text-xs font-bold text-bc-blue underline hover:text-bc-caramel"
              >
                Não tem uma chave? Gerar nova conta Nostr em 1 clique 🐾
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
