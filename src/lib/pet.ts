export type PetStats = {
  id: string;
  name: string;
  color: string;
  hunger: number;
  happiness: number;
  energy: number;
  level: number;
  experience: number;
  coins: number;
  lastCareAt: Date;
};

const HOURS_DECAY = 4;
const XP_PER_LEVEL = 100;

export function applyPetDecay(pet: PetStats): PetStats {
  if (!pet) return pet;
  const lastCare = pet.lastCareAt ? new Date(pet.lastCareAt).getTime() : Date.now();
  if (isNaN(lastCare)) return pet;

  const hours = (Date.now() - lastCare) / (1000 * 60 * 60);
  if (isNaN(hours) || hours < HOURS_DECAY) return pet;

  const ticks = Math.floor(hours / HOURS_DECAY);
  const decay = ticks * 8;

  return {
    ...pet,
    hunger: Math.max(0, (pet.hunger ?? 80) - decay),
    happiness: Math.max(0, (pet.happiness ?? 80) - decay),
    energy: Math.max(0, (pet.energy ?? 80) - decay),
  };
}

export function addExperience(pet: PetStats, xp: number): PetStats {
  let experience = pet.experience + xp;
  let level = pet.level;
  while (experience >= XP_PER_LEVEL) {
    experience -= XP_PER_LEVEL;
    level += 1;
  }
  return { ...pet, experience, level };
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

export type PetAvatarStatus = "happy" | "ok" | "hungry" | "starving";

/** Status visual no avatar do feed (efeito Tamagotchi coletivo). */
export function petAvatarStatus(pet: PetStats): PetAvatarStatus {
  const p = applyPetDecay(pet);
  if (p.hunger < 25) return "starving";
  if (p.hunger < 45) return "hungry";
  const avg = (p.hunger + p.happiness + p.energy) / 3;
  if (avg >= 70) return "happy";
  return "ok";
}

export type CareAction = "feed" | "play" | "rest";

export function applyCare(pet: PetStats, action: CareAction): PetStats {
  const base = applyPetDecay(pet);
  const now = new Date();
  let next = base;

  switch (action) {
    case "feed":
      next = {
        ...base,
        hunger: Math.min(100, base.hunger + 25),
        coins: base.coins + 2,
        lastCareAt: now,
      };
      break;
    case "play":
      next = {
        ...base,
        happiness: Math.min(100, base.happiness + 25),
        energy: Math.max(0, base.energy - 10),
        coins: base.coins + 3,
        lastCareAt: now,
      };
      break;
    case "rest":
      next = {
        ...base,
        energy: Math.min(100, base.energy + 30),
        lastCareAt: now,
      };
      break;
  }

  return addExperience(next, 15);
}

export function applyTreat(pet: PetStats): PetStats {
  const base = applyPetDecay(pet);
  const boosted = {
    ...base,
    happiness: Math.min(100, base.happiness + 15),
    hunger: Math.min(100, base.hunger + 10),
    coins: base.coins + 5,
    lastCareAt: new Date(),
  };
  return addExperience(boosted, 10);
}
