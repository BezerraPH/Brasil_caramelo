"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { REPUTATION_PERSONALITIES } from "@/lib/constants";
import type { DogReputationLevel } from "@/generated/prisma/enums";

type ReputationPickerProps = {
  toUserId: string;
  myLevel?: DogReputationLevel | null;
};

export function ReputationPicker({ toUserId, myLevel }: ReputationPickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<DogReputationLevel | null>(
    myLevel ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function rate(level: DogReputationLevel) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reputation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId, level }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Erro ao avaliar.");
        return;
      }
      setSelected(level);
      setMessage("Personalidade registrada! 🐾");
      router.refresh();
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-bc-blue">
        Qual personalidade canina combina com essa pessoa?
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {REPUTATION_PERSONALITIES.map((p) => (
          <button
            key={p.level}
            type="button"
            disabled={saving}
            onClick={() => rate(p.level)}
            className={`rounded-xl border-2 p-3 text-left transition ${
              selected === p.level
                ? "border-bc-green bg-bc-green/10 ring-2 ring-bc-green/30"
                : "border-bc-blue/25 bg-bc-white hover:border-bc-blue"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                {p.emoji}
              </span>
              <div>
                <span className="block text-sm font-bold text-bc-blue">
                  {p.archetype}
                </span>
                <span className="text-xs text-bc-brown">{p.breed}</span>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-bc-brown">{p.profile}</p>
            <p className="mt-1 text-[11px] leading-snug text-gray-600">
              {p.behavior}
            </p>
          </button>
        ))}
      </div>
      {message && <p className="text-xs text-bc-green">{message}</p>}
    </div>
  );
}

