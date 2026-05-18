"use client";

import { useEffect, useState } from "react";

type Checkout = {
  provider: string;
  amountBrl: string;
  pixKey: string | null;
  instructions: string;
};

export function PedigreePaymentCard() {
  const [info, setInfo] = useState<Checkout | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/premium/checkout")
      .then((r) => r.json())
      .then((d) => setInfo(d))
      .catch(() => {});
  }, []);

  if (!info) return null;

  async function copyPix() {
    if (!info?.pixKey) return;
    await navigator.clipboard.writeText(info.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="bc-card mt-6 border-bc-gold/25 p-5">
      <h2 className="font-bold text-bc-gold">💳 Apoio Pedigree</h2>
      <p className="mt-2 text-sm text-bc-brown">{info.instructions}</p>
      {info.provider === "pix_manual" && info.pixKey && (
        <div className="mt-4">
          <p className="text-xs text-bc-brown">
            Valor sugerido: R$ {info.amountBrl}
          </p>
          <p className="mt-2 break-all font-mono text-sm text-bc-blue">
            {info.pixKey}
          </p>
          <button
            type="button"
            onClick={() => void copyPix()}
            className="bc-btn-gold mt-3 w-full"
          >
            {copied ? "Copiado!" : "Copiar chave PIX"}
          </button>
        </div>
      )}
    </section>
  );
}
