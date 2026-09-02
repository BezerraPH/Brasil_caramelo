"use client";

import { useState } from "react";

type PetWithdrawModalProps = {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onSuccess: () => void;
};

export function PetWithdrawModal({
  isOpen,
  onClose,
  coins,
  onSuccess,
}: PetWithdrawModalProps) {
  const [amountCoins, setAmountCoins] = useState("100");
  const [invoice, setInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/pet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCoins, invoice }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível realizar o saque.");
        return;
      }
      setFeedback(data.message ?? "Saque enviado com sucesso via Lightning!");
      onSuccess();
    } catch {
      setError("Erro de conexão ao processar saque.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-bc-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-bc-caramel/20 pb-3">
          <h2 className="text-base font-black text-amber-900 flex items-center gap-1.5">
            <span>⚡🪙</span> Saque de CarameloCoins (Lightning)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-bc-brown/60 hover:text-bc-brown text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
          <p className="font-semibold text-bc-brown">
            Saldo disponível: <strong className="text-amber-900">🪙 {coins.toLocaleString()} CarameloCoins</strong>
          </p>
          <p className="mt-1 text-[11px] text-bc-brown/80">
            Converta suas moedas ganhas com carinhos e zaps em Satoshis na sua carteira Lightning favorita.
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-700">
            {error}
          </p>
        )}

        {feedback ? (
          <div className="space-y-3 text-center">
            <p className="text-sm font-black text-bc-green">{feedback}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-bc-green px-5 py-2 text-xs font-bold text-white shadow-xs"
            >
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-bc-brown mb-1">
                Quantidade de Moedas (Mínimo 100)
              </label>
              <input
                type="number"
                min="100"
                max={coins}
                value={amountCoins}
                onChange={(e) => setAmountCoins(e.target.value)}
                className="w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs font-bold text-bc-brown focus:border-bc-green focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-bc-brown mb-1">
                Fatura Lightning (Invoice lnbc...)
              </label>
              <textarea
                rows={3}
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="Cole aqui a fatura gerada na sua carteira (Alby, Phoenix, Wallet of Satoshi, etc.)"
                className="w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-[11px] font-mono text-bc-brown focus:border-bc-green focus:outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || coins < 100}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-50"
            >
              {loading ? "Processando envio Lightning…" : "⚡ Transferir Satoshis Agora"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
