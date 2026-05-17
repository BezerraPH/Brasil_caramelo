import type { DogReputationLevel } from "@/generated/prisma/enums";

export const DOG_REPUTATION_LEVELS = [
  "PITBULL",
  "HUSKY",
  "CARAMELO",
  "POODLE",
  "PINSCHER",
  "GOLDEN",
  "VIRALATA",
  "BORDER_COLLIE",
  "BASSET_HOUND",
  "CHOW_CHOW",
] as const;

export type ReputationPersonality = {
  level: DogReputationLevel;
  breed: string;
  emoji: string;
  about: string;
  vibe: string;
};

export const REPUTATION_PERSONALITIES: ReputationPersonality[] = [
  {
    level: "PITBULL",
    breed: "Pitbull",
    emoji: "🐕‍🦺",
    about: "Direto, intenso, não faz média.",
    vibe: "Digo a verdade doa a quem doer.",
  },
  {
    level: "HUSKY",
    breed: "Husky",
    emoji: "🐺",
    about: "Dramático, reclama de tudo, faz barulho.",
    vibe: "A vida é um caos e eu vou gritar sobre isso.",
  },
  {
    level: "CARAMELO",
    breed: "Caramelo",
    emoji: "🟤",
    about: "Raiz, humilde, gente boa, o sobrevivente.",
    vibe: "Tamo junto, aceito um café e um pix.",
  },
  {
    level: "POODLE",
    breed: "Poodle",
    emoji: "🐩",
    about: "Elegante, blasé, seletivo, classe alta.",
    vibe: "Meu feed é estético e eu não respondo DM.",
  },
  {
    level: "PINSCHER",
    breed: "Pinscher",
    emoji: "⚡",
    about: "220v, briguento, pavio curto, treteiro.",
    vibe: "Postou opinião errada? Vou comentar 10 vezes.",
  },
  {
    level: "GOLDEN",
    breed: "Golden",
    emoji: "🌟",
    about: "O biscoiteiro amigável, quer agradar todos.",
    vibe: "Amo vocês! Olhem como meu dia foi lindo!",
  },
  {
    level: "VIRALATA",
    breed: "Vira-lata",
    emoji: "🐕",
    about: "Desleixado (no bom sentido), low profile, relax.",
    vibe: "Posto foto tremida e não tô nem aí.",
  },
  {
    level: "BORDER_COLLIE",
    breed: "Border Collie",
    emoji: "🎯",
    about: "O produtivo, inteligente, posta tutorial de tudo.",
    vibe: "X dicas para você ser mais eficiente hoje.",
  },
  {
    level: "BASSET_HOUND",
    breed: "Basset Hound",
    emoji: "😴",
    about: "Preguiçoso, observador, só olha, não interage.",
    vibe: "Entrei, vi os stories e fui dormir.",
  },
  {
    level: "CHOW_CHOW",
    breed: "Chow Chow",
    emoji: "🧊",
    about: "Antissocial, fiel a poucos, difícil de conquistar.",
    vibe: "Não me segue que eu não te sigo.",
  },
];

export const REPUTATION_BY_LEVEL = Object.fromEntries(
  REPUTATION_PERSONALITIES.map((p) => [p.level, p]),
) as Record<DogReputationLevel, ReputationPersonality>;

export const REPUTATION_LEVELS = REPUTATION_PERSONALITIES;

export const VIEW_MODES = [
  { id: "FEED", label: "Feed", description: "Estilo comunidade (Orkut)", available: true },
  { id: "INSTA", label: "Insta", description: "Grade de fotos", available: true },
  { id: "REELS", label: "Cinelar", description: "Shorts com vídeo", available: true },
] as const;

export const PREMIUM_PERKS = {
  badge: "Pedigree",
  coinBonus: 1.5,
  treatLimitBonus: 5,
} as const;
