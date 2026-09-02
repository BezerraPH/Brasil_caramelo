"use client";

import { useState } from "react";
import Image from "next/image";
import type { NostrProfileMetadata } from "@/lib/nostr/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  targetPubkey?: string;
  targetProfile?: NostrProfileMetadata;
  targetEventId?: string;
};

const PRESET_AMOUNTS = [21, 100, 500, 1000, 5000];

export function NostrZapModal({
  isOpen,
  onClose,
  targetProfile,
}: Props) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [comment, setComment] = useState("🐾 Um biscoito para este post!");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const recipientName =
    targetProfile?.name || targetProfile?.display_name || "Criador Nostr";
  const lud16 = targetProfile?.lud16 || "";

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

  function handleQuickSelect(sats: number) {
    setAmount(sats);
    setCustomAmount("");
  }

  function handleOpenLightning() {
    if (!lud16) return;

    // Se tiver lud16 (ex: usuario@getalby.com), podemos criar a URL de pagamento Lightning
    const lnUrl = `lightning:${lud16}?amount=${effectiveAmount * 1000}&comment=${encodeURIComponent(
      comment,
    )}`;

    if (typeof window !== "undefined") {
      window.location.href = lnUrl;
    }
  }

  async function copyLightningAddress() {
    if (!lud16) return;
    try {
      await navigator.clipboard.writeText(lud16);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bc-card relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-bc-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-bc-brown/60 hover:bg-black/5 hover:text-bc-brown"
          title="Fechar"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-2xl text-white shadow-md">
            ⚡
          </div>
          <div>
            <h2 className="text-xl font-black text-bc-blue">Enviar Zap Lightning</h2>
            <p className="text-xs text-bc-brown/70">
              Gorjeta em satoshis para <span className="font-bold">{recipientName}</span>
            </p>
          </div>
        </div>

        {targetProfile?.picture && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-500/10 p-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-amber-400">
              <Image
                src={targetProfile.picture}
                alt={recipientName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-bc-blue">{recipientName}</p>
              <p className="text-[11px] font-mono text-amber-800 truncate">
                ⚡ {lud16 || "Endereço Lightning não configurado"}
              </p>
            </div>
          </div>
        )}

        {!lud16 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-center">
            <span className="text-2xl">⚠️</span>
            <p className="mt-2 text-xs font-semibold text-bc-brown">
              Este autor ainda não configurou um Lightning Address (lud16) no seu perfil Nostr.
            </p>
            <p className="mt-1 text-[11px] text-bc-brown/70">
              Peça para ele adicionar um endereço (como Alby ou Wallet of Satoshi) no perfil!
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Seletor de Valor */}
            <div>
              <label className="block text-xs font-bold text-bc-brown">
                Quantidade de Satoshis (sats)
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_AMOUNTS.map((sats) => (
                  <button
                    key={sats}
                    type="button"
                    onClick={() => handleQuickSelect(sats)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      effectiveAmount === sats && !customAmount
                        ? "bg-amber-500 text-white shadow-md scale-105"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-900 hover:bg-amber-500/20"
                    }`}
                  >
                    ⚡ {sats} sats
                  </button>
                ))}
              </div>

              <div className="mt-2">
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Ou digite outro valor..."
                  className="w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Mensagem / Comentário */}
            <div>
              <label className="block text-xs font-bold text-bc-brown">
                Mensagem do Zap (opcional)
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Um petisco pro dog caramelo!"
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleOpenLightning}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all"
              >
                <span>⚡</span>
                <span>Pagar {effectiveAmount} sats via Carteira</span>
              </button>

              <button
                type="button"
                onClick={copyLightningAddress}
                className="rounded-xl border border-bc-caramel/20 py-2 text-center text-xs font-medium text-bc-brown/70 hover:bg-black/5"
              >
                {copied ? "✓ Endereço Copiado!" : `Copiar endereço: ${lud16}`}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-bc-caramel/15 pt-3 text-center">
          <p className="text-[10px] text-bc-brown/60">
            Transmitido via Lightning Network P2P Bitcoin com liquidação instantânea em milissegundos.
          </p>
        </div>
      </div>
    </div>
  );
}
