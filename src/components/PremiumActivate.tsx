"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PremiumActivate() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function activate() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg("Pedigree ativado por 30 dias! 👑");
      router.refresh();
    } else setMsg(data.error ?? "Código inválido.");
  }

  return (
    <div className="bc-card border-bc-gold/30 p-6">
      <input
        className="bc-input mb-3"
        placeholder="Código (ex: PEDIGREE)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        type="button"
        disabled={loading}
        onClick={activate}
        className="bc-btn-gold w-full"
      >
        {loading ? "Ativando…" : "Ativar Pedigree"}
      </button>
      {msg && <p className="mt-3 text-center text-sm text-bc-green">{msg}</p>}
      <p className="mt-3 text-center text-[10px] text-bc-brown">
        Demo: PEDIGREE, CARAMELO2026 ou MATILHA
      </p>
    </div>
  );
}
