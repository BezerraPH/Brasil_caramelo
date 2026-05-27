"use client";

import { useEffect, useState } from "react";

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

export function PedigreePaymentCard() {
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  useEffect(() => {
    void loadCheckout();
  }, []);

  const display = order ?? info;

  async function copyRef() {
    const text = order?.reference ?? "";
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!display && !error) {
    return (
      <section className="bc-card mt-6 border-bc-gold/25 p-5 animate-pulse text-sm text-bc-brown">
        Carregando checkout…
      </section>
    );
  }

  return (
    <section className="bc-card bc-pedigree-pay mt-6 border-bc-gold/30 p-5">
      <h2 className="font-bold text-bc-gold">💳 Pedigree — 30 dias</h2>
      <p className="mt-2 text-sm text-bc-brown">
        {order?.instructions ?? info?.instructions}
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-700">{error}</p>
      )}

      {order ? (
        <div className="mt-4 space-y-3 rounded-xl border border-bc-gold/25 bg-bc-gold/5 p-4">
          <p className="text-xs text-bc-brown">
            Valor: <strong>R$ {order.amountBrl}</strong>
          </p>
          <p className="font-mono text-lg font-bold tracking-wide text-bc-blue">
            {order.reference}
          </p>
          <p className="text-xs text-bc-brown">
            Use esta referência na descrição do PIX (@{order.username})
          </p>
          {order.pixKey && (
            <p className="break-all font-mono text-sm text-bc-brown">
              Chave: {order.pixKey}
            </p>
          )}
          <button
            type="button"
            onClick={() => void copyRef()}
            className="bc-btn-gold w-full"
          >
            {copied ? "Copiado!" : "Copiar referência"}
          </button>
          {order.mercadoPago?.checkoutUrl && (
            <a
              href={order.mercadoPago.checkoutUrl}
              className="bc-btn-primary block w-full text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pagar com Mercado Pago
            </a>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => void createOrder()}
          className="bc-btn-gold mt-4 w-full"
        >
          {loading ? "Gerando pedido…" : "Gerar pedido PIX"}
        </button>
      )}

      <p className="mt-3 text-[10px] text-bc-brown/70">
        Após confirmação do pagamento, o Pedigree ativa automaticamente (webhook) ou
        use um código em /premium.
      </p>
    </section>
  );
}
