"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type OrderRow = {
  id: string;
  reference: string;
  amountBrl: string;
  status: string;
  createdAt: string;
  user: { username: string; name: string };
};

export function PremiumAdminPanel() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/premium/orders/admin");
    if (res.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (res.ok) setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useAsyncEffect(() => {
    void load();
  }, [load]);

  async function confirmPaid(orderId: string) {
    setBusyId(orderId);
    const res = await fetch(`/api/premium/orders/${orderId}/confirm`, {
      method: "POST",
    });
    if (res.ok) await load();
    setBusyId(null);
  }

  if (forbidden) return null;

  const pending = orders.filter((o) => o.status === "PENDING");

  return (
    <section className="bc-card bc-animate-in mt-8 border-bc-gold/40 p-5">
      <h2 className="font-bold text-bc-gold">Painel Pedigree (admin)</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Confirme PIX manual — defina{" "}
        <code className="text-[10px]">PREMIUM_ADMIN_USERNAMES</code> no servidor
      </p>

      {loading ? (
        <p className="mt-3 animate-pulse text-sm text-bc-brown">Carregando pedidos…</p>
      ) : pending.length === 0 ? (
        <p className="mt-3 text-sm text-bc-brown">Nenhum pedido pendente.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {pending.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bc-gold/20 bg-bc-cream/40 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-semibold text-bc-blue">
                  @{o.user.username} · R$ {o.amountBrl}
                </p>
                <p className="text-xs text-bc-brown">
                  {o.reference} · {new Date(o.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <button
                type="button"
                className="bc-btn-primary text-xs"
                disabled={busyId === o.id}
                onClick={() => void confirmPaid(o.id)}
              >
                {busyId === o.id ? "…" : "Confirmar PIX"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
