export type PetStats = {
  id: string;
  name: string;
  color: string;
  hunger: number;
  happiness: number;
  energy: number;
  lastCareAt: Date;
};

const HOURS_DECAY = 4;

export function applyPetDecay(pet: PetStats): PetStats {
  const hours =
    (Date.now() - new Date(pet.lastCareAt).getTime()) / (1000 * 60 * 60);
  if (hours < HOURS_DECAY) return pet;

  const ticks = Math.floor(hours / HOURS_DECAY);
  const decay = ticks * 8;

  return {
    ...pet,
    hunger: Math.max(0, pet.hunger - decay),
    happiness: Math.max(0, pet.happiness - decay),
    energy: Math.max(0, pet.energy - decay),
  };
}

export function petMood(pet: PetStats): {
  label: string;
  emoji: string;
  color: string;
} {
  const avg = (pet.hunger + pet.happiness + pet.energy) / 3;
  if (avg >= 70) return { label: "Feliz", emoji: "🐕", color: "#2d8b57" };
  if (avg >= 40) return { label: "Ok", emoji: "🐶", color: "#1b6ca8" };
  return { label: "Precisa de carinho", emoji: "😢", color: "#8b5e3c" };
}

export type CareAction = "feed" | "play" | "rest";

export function applyCare(pet: PetStats, action: CareAction): PetStats {
  const base = applyPetDecay(pet);
  const now = new Date();

  switch (action) {
    case "feed":
      return {
        ...base,
        hunger: Math.min(100, base.hunger + 25),
        lastCareAt: now,
      };
    case "play":
      return {
        ...base,
        happiness: Math.min(100, base.happiness + 25),
        energy: Math.max(0, base.energy - 10),
        lastCareAt: now,
      };
    case "rest":
      return {
        ...base,
        energy: Math.min(100, base.energy + 30),
        lastCareAt: now,
      };
  }
}
