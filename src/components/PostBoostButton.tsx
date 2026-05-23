"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAchievementToast } from "@/lib/achievement-defs";
import type { AchievementKey } from "@/lib/achievement-defs";
import { BOOST_COST_COINS } from "@/lib/post-boost-constants";
import { useToast } from "./ToastProvider";

type PostBoostButtonProps = {
  postId: string;
  boostedUntil: string | null;
};

export function PostBoostButton({ postId, boostedUntil }: PostBoostButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const active = Boolean(
    boostedUntil && new Date(boostedUntil) > new Date(),
  );

  if (active) {
    return (
      <span className="rounded-full bg-bc-gold/20 px-2 py-0.5 text-[10px] font-bold text-bc-gold">
        🚀 Impulsionado
      </span>
    );
  }

  async function boost() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/posts/${postId}/boost`, { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        newAchievement?: AchievementKey | null;
      };
      if (res.ok) {
        if (data.newAchievement) {
          toast(formatAchievementToast(data.newAchievement), "achievement");
        }
        router.refresh();
      } else {
        setMsg(data.error ?? "Falha ao impulsionar.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={loading}
        onClick={() => void boost()}
        className="rounded-lg px-2 py-1 text-xs font-semibold text-bc-caramel hover:bg-bc-caramel/10"
        title={`Custa ${BOOST_COST_COINS} CarameloCoins por 2h`}
      >
        {loading ? "…" : `🚀 Impulsionar (${BOOST_COST_COINS}🪙)`}
      </button>
      {msg && <span className="text-[10px] text-bc-brown">{msg}</span>}
    </span>
  );
}
