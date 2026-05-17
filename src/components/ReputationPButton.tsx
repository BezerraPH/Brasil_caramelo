"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { REPUTATION_PERSONALITIES } from "@/lib/constants";
import type { DogReputationLevel } from "@/generated/prisma/enums";

type ReputationPButtonProps = {
  toUserId: string;
  myLevel?: DogReputationLevel | null;
};

export function ReputationPButton({ toUserId, myLevel }: ReputationPButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DogReputationLevel | null>(
    myLevel ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(myLevel ?? null);
  }, [myLevel]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function vote(level: DogReputationLevel) {
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
        setMessage(data.error ?? "Erro ao votar.");
        return;
      }
      setSelected(level);
      setMessage("Latido registrado!");
      setOpen(false);
      router.refresh();
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={menuRef} className="relative inline-flex flex-col items-end">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        title="Personalidade canina — toque para votar"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-bc-blue text-lg font-bold text-white shadow-md ring-2 ring-bc-white transition hover:bg-bc-green hover:scale-105 disabled:opacity-60"
      >
        P
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 max-h-[min(70vh,420px)] w-[min(100vw-2rem,320px)] overflow-y-auto rounded-2xl border-2 border-bc-blue/30 bg-bc-white py-2 shadow-xl"
        >
          <p className="border-b border-bc-blue/10 px-3 pb-2 text-center text-xs font-semibold text-bc-blue">
            Qual vibe combina?
          </p>
          <ul className="divide-y divide-bc-blue/5">
            {REPUTATION_PERSONALITIES.map((p) => (
              <li key={p.level}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected === p.level}
                  disabled={saving}
                  onClick={() => vote(p.level)}
                  className={`w-full px-3 py-2.5 text-left transition hover:bg-bc-green/5 ${
                    selected === p.level ? "bg-bc-green/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden>
                      {p.emoji}
                    </span>
                    <span className="font-semibold text-bc-blue">{p.breed}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-bc-brown">{p.about}</p>
                  <p className="text-[10px] italic text-gray-500">"{p.vibe}"</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && !open && (
        <p className="mt-1 max-w-[200px] text-right text-[10px] text-bc-green">
          {message}
        </p>
      )}
    </div>
  );
}
