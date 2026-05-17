"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { REPUTATION_LEVELS } from "@/lib/constants";
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
      setMessage("Latido registrado! 🐾");
      router.refresh();
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-bc-blue">
        Como você vê essa pessoa?
      </p>
      <div className="flex flex-wrap gap-2">
        {REPUTATION_LEVELS.map((r) => (
          <button
            key={r.level}
            type="button"
            disabled={saving}
            onClick={() => rate(r.level)}
            title={r.description}
            className={`flex flex-col items-center rounded-xl border-2 px-3 py-2 text-xs transition ${
              selected === r.level
                ? "border-bc-green bg-bc-green/10"
                : "border-bc-blue/30 hover:border-bc-blue"
            }`}
          >
            <span className="text-xl">{r.emoji}</span>
            <span className="font-medium text-bc-brown">{r.label}</span>
          </button>
        ))}
      </div>
      {message && (
        <p className="text-xs text-bc-green">{message}</p>
      )}
    </div>
  );
}
