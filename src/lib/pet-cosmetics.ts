export type CosmeticSlot = "hat" | "collar" | "accessory";

export type PetCosmetic = {
  id: string;
  name: string;
  emoji: string;
  slot: CosmeticSlot;
  price: number;
  description: string;
};

export const PET_COSMETICS: PetCosmetic[] = [
  {
    id: "cap_caramelo",
    name: "Boné Caramelo",
    emoji: "🧢",
    slot: "hat",
    price: 35,
    description: "Estilo boteco raiz.",
  },
  {
    id: "cap_pitbull",
    name: "Boné de Lado",
    emoji: "🎩",
    slot: "hat",
    price: 40,
    description: "Atitude de rua.",
  },
  {
    id: "chain_pitbull",
    name: "Corrente de Ouro",
    emoji: "⛓️",
    slot: "collar",
    price: 55,
    description: "Brilho de Pitbull.",
  },
  {
    id: "bow_golden",
    name: "Laço Golden",
    emoji: "🎀",
    slot: "collar",
    price: 30,
    description: "Fofo e biscoiteiro.",
  },
  {
    id: "glasses_poodle",
    name: "Óculos Poodle",
    emoji: "🕶️",
    slot: "accessory",
    price: 45,
    description: "Chique demais.",
  },
  {
    id: "ball_viralata",
    name: "Bolinha",
    emoji: "⚽",
    slot: "accessory",
    price: 25,
    description: "Clássico do quintal.",
  },
  {
    id: "bandana_husky",
    name: "Bandana Gelada",
    emoji: "🧣",
    slot: "collar",
    price: 38,
    description: "Frio dramático.",
  },
  {
    id: "crown_chow",
    name: "Coroa Chow",
    emoji: "👑",
    slot: "hat",
    price: 80,
    description: "Realeza antissocial.",
  },
];

export const COSMETIC_BY_ID = Object.fromEntries(
  PET_COSMETICS.map((c) => [c.id, c]),
) as Record<string, PetCosmetic>;

export function getEquippedDisplay(pet: {
  equippedHat?: string | null;
  equippedCollar?: string | null;
  equippedAccessory?: string | null;
}) {
  const parts: string[] = [];
  if (pet.equippedHat) {
    const c = COSMETIC_BY_ID[pet.equippedHat];
    if (c) parts.push(c.emoji);
  }
  if (pet.equippedCollar) {
    const c = COSMETIC_BY_ID[pet.equippedCollar];
    if (c) parts.push(c.emoji);
  }
  if (pet.equippedAccessory) {
    const c = COSMETIC_BY_ID[pet.equippedAccessory];
    if (c) parts.push(c.emoji);
  }
  return parts;
}
