"use client";

import { useCallback, useEffect, useState } from "react";
import { getEquippedDisplay } from "@/lib/pet-cosmetics";
import { PetCosmeticShop } from "./PetCosmeticShop";

type PetData = {
  id: string;
  name: string;
  color: string;
  hunger: number;
  energy: number;
  happiness: number;
  level: number;
  experience: number;
  coins: number;
  ownedCosmetics: string[];
  equippedHat: string | null;
  equippedCollar: string | null;
  equippedAccessory: string | null;
};

type Mood = { label: string; emoji: string; color: string };

export function PetGame() {
  const [pet, setPet] = useState<PetData | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [bounce, setBounce] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/pet");
    const data = await res.json();
    if (res.ok) {
      setPet(data.pet);
      setMood(data.mood);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function care(action: "feed" | "play" | "rest") {
    setActing(action);
    try {
      const res = await fetch("/api/pet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setPet(data.pet);
        setMood(data.mood);
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
      }
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="bc-card animate-pulse p-10 text-center text-bc-brown">
        Acordando o cachorro…
      </div>
    );
  }

  if (!pet || !mood) return null;

  const equipped = getEquippedDisplay(pet);
  const shopState = {
    coins: pet.coins,
    ownedCosmetics: pet.ownedCosmetics,
    equippedHat: pet.equippedHat,
    equippedCollar: pet.equippedCollar,
    equippedAccessory: pet.equippedAccessory,
  };

  const bars = [
    { label: "Fome", value: pet.hunger, color: "bg-bc-caramel" },
    { label: "Felicidade", value: pet.happiness, color: "bg-bc-green" },
    { label: "Energia", value: pet.energy, color: "bg-bc-blue" },
  ];

  return (
    <div className="bc-animate-in-up space-y-6">
      <div className="bc-card overflow-hidden p-0">
        <div className="bg-gradient-to-br from-bc-blue/20 via-bc-green/15 to-bc-caramel/25 px-6 py-10 text-center">
          <div
            className={`mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full text-6xl shadow-inner transition-transform ${bounce ? "bc-animate-pop scale-110" : ""}`}
            style={{
              backgroundColor: `${pet.color}33`,
              border: `4px solid ${pet.color}`,
            }}
          >
            🐕
          </div>
          <h2 className="text-2xl font-bold text-bc-blue">{pet.name}</h2>
          <p className="mt-1 text-sm font-medium" style={{ color: mood.color }}>
            {mood.emoji} {mood.label}
          </p>
          <p className="mt-2 text-xs text-bc-brown">
            Nv. {pet.level} · {pet.experience}/100 XP · 🪙 {pet.coins} CarameloCoins
          </p>
        </div>

        <div className="space-y-4 p-6">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex justify-between text-xs font-medium text-bc-brown">
                <span>{b.label}</span>
                <span>{b.value}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-bc-blue/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${b.color}`}
                  style={{ width: `${b.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { action: "feed" as const, icon: "🍖", label: "Alimentar" },
            { action: "play" as const, icon: "🎾", label: "Brincar" },
            { action: "rest" as const, icon: "😴", label: "Descansar" },
          ] as const
        ).map((btn) => (
          <button
            key={btn.action}
            type="button"
            disabled={!!acting}
            onClick={() => care(btn.action)}
            className="bc-card bc-card-interactive flex flex-col items-center gap-1 p-4 transition disabled:opacity-50"
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-xs font-semibold text-bc-blue">
              {acting === btn.action ? "…" : btn.label}
            </span>
          </button>
        ))}
      </div>

      <PetCosmeticShop
        initial={shopState}
        onUpdate={(next) => {
          setPet((p) => (p ? { ...p, ...next } : p));
        }}
      />

      <p className="text-center text-xs text-bc-brown/70">
        Os status caem a cada 4 horas sem cuidado. Volte todo dia!
      </p>
    </div>
  );
}
