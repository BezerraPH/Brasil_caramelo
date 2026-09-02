"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { playBarkSound } from "@/lib/sound-fx";

export function PetMiniWidget() {
  const [petMood, setPetMood] = useState<{ emoji: string; status: string }>({
    emoji: "🐕",
    status: "Feliz",
  });

  useEffect(() => {
    async function loadPet() {
      try {
        const res = await fetch("/api/pet");
        if (res.ok) {
          const data = await res.json();
          const pet = data.pet;
          if (pet) {
            if (pet.hunger > 70) {
              setPetMood({ emoji: "🍖", status: "Com Fome" });
            } else if (pet.energy < 30) {
              setPetMood({ emoji: "😴", status: "Com Sono" });
            } else if (pet.happiness > 80) {
              setPetMood({ emoji: "🐶", status: "Super Feliz" });
            } else {
              setPetMood({ emoji: "🐕", status: "Tranquilo" });
            }
          }
        }
      } catch {
        // Silencioso
      }
    }
    loadPet();
  }, []);

  return (
    <Link
      href="/cachorro"
      onClick={() => playBarkSound()}
      className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-bold text-bc-brown/80 hover:text-amber-600 transition group"
      title={`Meu Pet Caramelo (${petMood.status})`}
    >
      <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 group-hover:scale-110 transition">
        <span className="text-sm leading-none animate-bounce">{petMood.emoji}</span>
      </div>
      <span className="text-[10px] font-black text-amber-900 dark:text-amber-400">Pet</span>
    </Link>
  );
}
