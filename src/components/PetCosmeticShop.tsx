"use client";

import { useState } from "react";
import {
  getEquippedDisplay,
  PET_COSMETICS,
  type PetCosmetic,
} from "@/lib/pet-cosmetics";

type PetShopData = {
  coins: number;
  ownedCosmetics: string[];
  equippedHat: string | null;
  equippedCollar: string | null;
  equippedAccessory: string | null;
};

type PetCosmeticShopProps = {
  initial: PetShopData;
  onUpdate: (pet: PetShopData) => void;
};

export function PetCosmeticShop({ initial, onUpdate }: PetCosmeticShopProps) {
  const [pet, setPet] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function act(action: "buy" | "equip" | "unequip", cosmeticId: string) {
    setLoading(cosmeticId);
    setMessage(null);
    try {
      const res = await fetch("/api/pet/cosmetics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, cosmeticId }),
      });
      const data = await res.json();
      if (res.ok) {
        const next: PetShopData = {
          coins: data.pet.coins,
          ownedCosmetics: data.pet.ownedCosmetics,
          equippedHat: data.pet.equippedHat,
          equippedCollar: data.pet.equippedCollar,
          equippedAccessory: data.pet.equippedAccessory,
        };
        setPet(next);
        onUpdate(next);
        setMessage(action === "buy" ? "Item comprado!" : "Atualizado!");
      } else {
        setMessage(data.error ?? "Erro.");
      }
    } finally {
      setLoading(null);
    }
  }

  function isEquipped(c: PetCosmetic) {
    if (c.slot === "hat") return pet.equippedHat === c.id;
    if (c.slot === "collar") return pet.equippedCollar === c.id;
    return pet.equippedAccessory === c.id;
  }

  const equipped = getEquippedDisplay(pet);

  return (
    <section className="bc-card p-5">
      <h2 className="mb-1 font-bold text-bc-blue">Loja Caramelo</h2>
      <p className="mb-4 text-xs text-bc-brown">
        🪙 {pet.coins} CarameloCoins
        {equipped.length > 0 && (
          <span className="ml-2">Equipado: {equipped.join(" ")}</span>
        )}
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {PET_COSMETICS.map((c) => {
          const owned = pet.ownedCosmetics.includes(c.id);
          const equippedNow = isEquipped(c);
          return (
            <li
              key={c.id}
              className="flex flex-col rounded-xl border border-bc-blue/10 bg-bc-white/80 p-3"
            >
              <span className="text-2xl">{c.emoji}</span>
              <p className="font-semibold text-sm text-bc-blue">{c.name}</p>
              <p className="text-[11px] text-bc-brown">{c.description}</p>
              <p className="mt-1 text-xs font-medium text-bc-caramel">
                {owned ? "Seu" : `${c.price} moedas`}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {!owned ? (
                  <button
                    type="button"
                    disabled={!!loading}
                    onClick={() => act("buy", c.id)}
                    className="bc-btn-primary px-3 py-1 text-xs"
                  >
                    {loading === c.id ? "…" : "Comprar"}
                  </button>
                ) : equippedNow ? (
                  <button
                    type="button"
                    disabled={!!loading}
                    onClick={() => act("unequip", c.id)}
                    className="bc-btn-secondary px-3 py-1 text-xs"
                  >
                    Desequipar
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!!loading}
                    onClick={() => act("equip", c.id)}
                    className="bc-btn-primary px-3 py-1 text-xs"
                  >
                    Equipar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {message && (
        <p className="mt-3 text-center text-xs font-medium text-bc-green">{message}</p>
      )}
    </section>
  );
}
