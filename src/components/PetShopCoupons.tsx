"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type Coupon = {
  id: string;
  shopName: string;
  title: string;
  coinCost: number;
  neighborhood: string | null;
  address: string | null;
  partnerUrl: string | null;
  redeemed: boolean;
  qrToken: string | null;
};

type PetShopCouponsProps = {
  region?: string | null;
};

export function PetShopCoupons({ region }: PetShopCouponsProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!region?.trim()) return;
    const res = await fetch(
      `/api/pet-shop/coupons?region=${encodeURIComponent(region)}`,
    );
    const data = await res.json();
    if (res.ok) setCoupons(data.coupons ?? []);
  }, [region]);

  useAsyncEffect(load, [load]);

  if (!region?.trim()) return null;

  async function redeem(couponId: string) {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/pet-shop/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg(`Cupom resgatado! Código: ${data.code} · QR: ${data.qrToken}`);
      await load();
    } else setMsg(data.error ?? "Falha.");
  }

  return (
    <section className="bc-card mt-6 border-bc-green/25 bg-gradient-to-r from-bc-green/5 to-bc-cream p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-bc-green">🏪 Pet shops em {region}</h2>
        <Link href="/pet-shops" className="bc-btn-ghost text-xs">
          Ver mapa →
        </Link>
      </div>
      <p className="mt-2 text-xs text-bc-brown">
        Troque CarameloCoins por cupons reais — apresente o QR na loja parceira.
      </p>
      {coupons.length === 0 ? (
        <p className="mt-4 text-sm text-bc-brown">
          Nenhum cupom nesta região.{" "}
          <Link href="/pet-shops" className="text-bc-blue hover:underline">
            Explorar parceiros
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {coupons.map((c, i) => (
            <li
              key={c.id}
              className="bc-coupon-card bc-animate-in-up rounded-xl border border-bc-green/20 bg-bc-white/80 p-4"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <p className="text-xs font-semibold text-bc-green">{c.shopName}</p>
              <p className="font-medium text-bc-blue">{c.title}</p>
              {c.neighborhood && (
                <p className="text-xs text-bc-brown">📍 {c.neighborhood}</p>
              )}
              {c.address && (
                <p className="text-[10px] text-bc-brown/80">{c.address}</p>
              )}
              <p className="mt-1 text-xs text-bc-brown">{c.coinCost} 🪙</p>
              {c.redeemed && c.qrToken ? (
                <p className="bc-coupon-qr mt-2 rounded-lg bg-bc-green/10 p-2 font-mono text-[10px] text-bc-blue">
                  QR: {c.qrToken}
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void redeem(c.id)}
                    className="bc-btn-primary text-xs"
                  >
                    Resgatar cupom
                  </button>
                  {c.partnerUrl && (
                    <a
                      href={c.partnerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bc-btn-ghost text-xs"
                    >
                      Mapa
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {msg && <p className="mt-3 text-xs text-bc-green">{msg}</p>}
    </section>
  );
}
