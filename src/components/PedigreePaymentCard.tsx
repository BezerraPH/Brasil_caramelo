"use client";

import { useEffect, useState } from "react";
import { isWebLNAvailable, payWithWebLN } from "@/lib/nostr/webln";

type CheckoutInfo = {
  provider: string;
  amountBrl: string;
  pixKey: string | null;
  hasMercadoPago: boolean;
  instructions: string;
};

type OrderResponse = {
  reference: string;
  amountBrl: string;
  pixKey: string | null;
  username: string;
  instructions: string;
  mercadoPago?: { checkoutUrl: string | null } | null;
};

type LightningOrder = {
  orderId: string;
  reference: string;
  amountSats: number;
  invoice: string;
  weblnAvailable: boolean;
};

export function PedigreePaymentCard() {
  const [method, setMethod] = useState<"pix" | "lightning">("pix");
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [lnOrder, setLnOrder] = useState<LightningOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lnSuccess, setLnSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCheckout() {
    const res = await fetch("/api/premium/checkout");
    const data = await res.json();
    if (res.ok) setInfo(data);
  }

  async function createOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/premium/orders", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar o pedido.");
        return;
      }
      setOrder(data);
      if (!info) await loadCheckout();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function createLightningOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/premium/lightning", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível gerar fatura Lightning.");
        return;
      }
      setLnOrder(data);
    } catch {
      setError("Erro de conexão com Lightning Network.");
    } finally {
      setLoading(false);
    }
  }

  async function handleWebLNPay() {
    if (!lnOrder?.invoice) return;
    setLoading(true);
    setError(null);
    try {
      if (isWebLNAvailable()) {
        const result = await payWithWebLN(lnOrder.invoice);
        if (result.success) {
          setLnSuccess(true);
        } else {
          setError(result.error ?? "Falha no pagamento WebLN.");
        }
      } else {
        await navigator.clipboard.writeText(lnOrder.invoice);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/premium/checkout")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setInfo(data);
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, []);

  async function copyText(text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="bc-card bc-pedigree-pay mt-6 border border-bc-gold/30 bg-bc-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-bc-gold/20 pb-4">
        <div>
          <h2 className="text-lg font-black text-amber-900 flex items-center gap-1.5">
            <span>👑</span> Assinatura Pedigree (VIP)
          </h2>
          <p className="text-xs font-semibold text-bc-brown">
            Vantagens exclusivas, 2x moedas, rolezinhos e selo dourado
          </p>
        </div>
      </div>

      {/* Tabs de Escolha de Pagamento */}
      <div className="mt-4 flex rounded-xl border border-bc-caramel/20 bg-bc-sand/20 p-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMethod("pix")}
          className={`flex-1 rounded-lg py-2 transition ${
            method === "pix"
              ? "bg-bc-white text-bc-blue shadow-xs font-black"
              : "text-bc-brown/70 hover:text-bc-blue"
          }`}
        >
          🇧🇷 Pix / Mercado Pago (R$ 15/mês)
        </button>
        <button
          type="button"
          onClick={() => setMethod("lightning")}
          className={`flex-1 rounded-lg py-2 transition ${
            method === "lightning"
              ? "bg-bc-white text-amber-900 shadow-xs font-black"
              : "text-bc-brown/70 hover:text-amber-900"
          }`}
        >
          ⚡ Lightning / Sats (21.000 sats)
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 p-2.5 text-center text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      {/* Aba Pix */}
      {method === "pix" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-bc-brown">
            {order?.instructions ?? info?.instructions ?? "Pague via PIX ou Mercado Pago com confirmação instantânea."}
          </p>

          {order ? (
            <div className="space-y-3 rounded-xl border border-bc-gold/25 bg-amber-500/5 p-4">
              <p className="text-xs text-bc-brown">
                Valor: <strong>R$ {order.amountBrl}</strong> (30 dias)
              </p>
              <p className="font-mono text-base font-black tracking-wide text-bc-blue">
                {order.reference}
              </p>
              <p className="text-[11px] text-bc-brown">
                Insira esta referência na descrição do PIX (@{order.username})
              </p>
              {order.pixKey && (
                <p className="break-all font-mono text-xs font-bold text-bc-brown">
                  Chave Pix: {order.pixKey}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void copyText(order.reference)}
                  className="rounded-xl border border-bc-caramel/30 bg-bc-white px-4 py-2 text-xs font-bold text-bc-brown hover:bg-bc-sand/30 flex-1 transition"
                >
                  {copied ? "✓ Copiado!" : "Copiar Referência"}
                </button>
                {order.pixKey && (
                  <button
                    type="button"
                    onClick={() => void copyText(order.pixKey!)}
                    className="rounded-xl border border-bc-caramel/30 bg-bc-white px-4 py-2 text-xs font-bold text-bc-brown hover:bg-bc-sand/30 flex-1 transition"
                  >
                    Copiar Chave Pix
                  </button>
                )}
              </div>
              {order.mercadoPago?.checkoutUrl && (
                <a
                  href={order.mercadoPago.checkoutUrl}
                  className="block w-full rounded-xl bg-gradient-to-r from-bc-green to-bc-caramel py-2.5 text-center text-xs font-black text-white shadow-xs hover:opacity-95 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💳 Pagar no Cartão / Pix via Mercado Pago
                </a>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => void createOrder()}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition"
            >
              {loading ? "Gerando pedido…" : "Gerar Pedido Pix (R$ 15,00)"}
            </button>
          )}
        </div>
      )}

      {/* Aba Lightning */}
      {method === "lightning" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-bc-brown">
            Assine o Pedigree usando a rede Lightning do Bitcoin sem intermediários bancários ou taxas.
          </p>

          {lnSuccess ? (
            <div className="rounded-xl border border-bc-green/30 bg-bc-green/10 p-4 text-center">
              <span className="text-3xl">🎉⚡</span>
              <p className="mt-2 text-sm font-black text-bc-green">Pagamento Lightning Confirmado!</p>
              <p className="mt-1 text-xs text-bc-brown">Seu selo e benefícios Pedigree foram ativados na matilha.</p>
            </div>
          ) : lnOrder ? (
            <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-bc-brown">Valor da Assinatura:</span>
                <span className="font-black text-amber-900">⚡ {lnOrder.amountSats.toLocaleString()} Sats (~30 dias)</span>
              </div>
              <p className="break-all font-mono text-[10px] text-bc-brown bg-bc-white p-2 rounded-lg border border-bc-caramel/20">
                {lnOrder.invoice}
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleWebLNPay()}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-black text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition flex items-center justify-center gap-1.5"
              >
                <span>⚡</span> {loading ? "Processando…" : "Pagar Instantâneo com WebLN / Carteira"}
              </button>
              <button
                type="button"
                onClick={() => void copyText(lnOrder.invoice)}
                className="w-full rounded-xl border border-bc-caramel/30 bg-bc-white py-2 text-xs font-bold text-bc-brown hover:bg-bc-sand/30 transition"
              >
                {copied ? "✓ Fatura Copiada!" : "📋 Copiar Código da Fatura (Lightning Invoice)"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => void createLightningOrder()}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition"
            >
              {loading ? "Gerando fatura…" : "⚡ Gerar Fatura Lightning (21.000 Sats)"}
            </button>
          )}
        </div>
      )}

      <p className="mt-4 text-center text-[10px] font-semibold text-bc-brown/70">
        💡 O plano Pedigree é ativado automaticamente e apoia o desenvolvimento soberano do Brasil Caramelo.
      </p>
    </section>
  );
}
