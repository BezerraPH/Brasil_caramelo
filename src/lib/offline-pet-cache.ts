const KEY = "bc_offline_pet_v1";

export type CachedPetSnapshot = {
  pet: {
    id: string;
    name: string;
    color: string;
    hunger: number;
    energy: number;
    happiness: number;
    level: number;
    experience: number;
    coins: number;
  };
  mood: { label: string; emoji: string; color: string };
  savedAt: string;
};

export function saveOfflinePet(snapshot: CachedPetSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* quota */
  }
}

export function loadOfflinePet(): CachedPetSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedPetSnapshot;
  } catch {
    return null;
  }
}
