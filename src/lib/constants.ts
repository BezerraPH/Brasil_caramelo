import type { DogReputationLevel } from "@/generated/prisma/enums";

export type ReputationPersonality = {
  level: DogReputationLevel;
  archetype: string;
  breed: string;
  emoji: string;
  profile: string;
  behavior: string;
};

/** Cinco personalidades ativas (sem ranking numérico — é “quem essa pessoa lembra”). */
export const REPUTATION_PERSONALITIES: ReputationPersonality[] = [
  {
    level: "POODLE",
    archetype: "O Inabalável",
    breed: "Poodle",
    emoji: "🐩",
    profile: "Calmo, elegante e polido.",
    behavior:
      "Mantém a pose mesmo sob pressão; não perde o foco nem a elegância.",
  },
  {
    level: "PITBULL",
    archetype: "O Bruto",
    breed: "Pitbull",
    emoji: "🐕‍🦺",
    profile: "Direto, intenso e sem rodeios.",
    behavior:
      "Resolve na força bruta; intimida sem precisar latir muito.",
  },
  {
    level: "VIRALATA",
    archetype: "O Despojado",
    breed: "Vira-lata",
    emoji: "🐕",
    profile: "Largado, relaxado e de boa.",
    behavior:
      "Não se estressa com regras ou estética; flui conforme a música.",
  },
  {
    level: "CARAMELO",
    archetype: "O Autêntico",
    breed: "Caramelo",
    emoji: "🟤",
    profile: "Raiz, resiliente e onipresente.",
    behavior:
      "Sobrevivente de verdade; conhece todo mundo e entende a malícia da rua.",
  },
  {
    level: "SALSICHA",
    archetype: "O Singular",
    breed: "Salsicha",
    emoji: "🌭",
    profile: "Teimoso, corajoso e sem meio-termo.",
    behavior:
      "Não passa despercebido; acha que é grandão e vai até o fim.",
  },
];

/** Próximas raças (fase futura — 10 personalidades) */
export const REPUTATION_PERSONALITIES_FUTURE = [
  { archetype: "O Reclamão", breed: "Husky" },
  { archetype: "O Explosivo", breed: "Pinscher" },
  { archetype: "O Good Vibes", breed: "Golden Retriever" },
  { archetype: "O Workaholic", breed: "Border Collie" },
  { archetype: "O Teimoso", breed: "Bulldog Inglês" },
  { archetype: "O Alerta", breed: "Chihuahua" },
] as const;

export const REPUTATION_BY_LEVEL: Record<
  DogReputationLevel,
  ReputationPersonality
> = Object.fromEntries(
  REPUTATION_PERSONALITIES.map((p) => [p.level, p]),
) as Record<DogReputationLevel, ReputationPersonality>;

/** @deprecated use REPUTATION_PERSONALITIES */
export const REPUTATION_LEVELS = REPUTATION_PERSONALITIES;

export const VIEW_MODES = [
  { id: "FEED", label: "Feed", description: "Estilo comunidade (Orkut)", available: true },
  { id: "INSTA", label: "Insta", description: "Grade de fotos", available: false },
  { id: "REELS", label: "Reels", description: "Vídeos curtos", available: false },
] as const;
