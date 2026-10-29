"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type NostrProvider = {
  getPublicKey: () => Promise<string>;
  signEvent?: (event: unknown) => Promise<unknown>;
};

type WindowWithNostr = Window & {
  nostr?: NostrProvider;
};

export function NostrExtensionLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualPubkey, setManualPubkey] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleNostrLogin(targetPubkey?: string) {
    setLoading(true);
    setErrorMsg(null);

    try {
      let pubkey = targetPubkey;

      // 1. Se não foi passado manualmente, tenta obter via extensão NIP-07
      if (!pubkey) {
        if (typeof window !== "undefined") {
          const win = window as unknown as WindowWithNostr;
          if (win.nostr) {
            try {
              pubkey = await win.nostr.getPublicKey();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "";
              throw new Error("Permissão recusada na extensão Nostr: " + msg);
            }
          } else {
            // Extensão não encontrada -> abre campo manual
            setManualMode(true);
            setLoading(false);
            return;
          }
        }
      }

      if (!pubkey) {
        throw new Error("Chave pública não encontrada.");
      }

      // 2. Envia para o backend para criar ou autenticar a conta
      const res = await fetch("/api/auth/nostr-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao entrar com Nostr");
      }

      // 3. Sucesso -> redireciona para o Feed
      router.push("/feed");
      router.refresh();
    } catch (err: unknown) {
      console.error("[NostrLogin]", err);
      const msg = err instanceof Error ? err.message : "Erro ao conectar com Nostr.";
      setErrorMsg(msg);
      setLoading(false);
    }
  }

  return (
    <div className="w-full mt-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-center">
      <div className="flex items-center justify-center gap-2 mb-2 text-purple-900 dark:text-purple-300 font-bold text-sm">
        <span>⚡</span>
        <span>Entrada Soberana (100% Anônimo)</span>
      </div>
      <p className="text-xs text-purple-800 dark:text-purple-400 mb-3">
        Sem e-mail ou senha. Entre instantaneamente usando sua chave Nostr ou extensão Web3 (Alby, Nos2x).
      </p>

      {errorMsg && (
        <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {!manualMode ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleNostrLogin()}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Conectando...</span>
            ) : (
              <>
                <span>🟣</span>
                <span>Entrar com Extensão Nostr (Alby / NIP-07)</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="text-xs text-purple-700 dark:text-purple-400 hover:underline font-semibold"
          >
            Não tem extensão? Entrar colando chave npub
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualPubkey.trim()) {
              handleNostrLogin(manualPubkey.trim());
            }
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            placeholder="Cole seu npub1... ou chave hex"
            value={manualPubkey}
            onChange={(e) => setManualPubkey(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !manualPubkey.trim()}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar com esta Chave"}
            </button>
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="py-2 px-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg hover:bg-zinc-300 transition"
            >
              Voltar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
