import type { DogReputationLevel } from "@/generated/prisma/enums";

export const REPUTATION_LEVELS: {
  level: DogReputationLevel;
  rank: number;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    level: "PITBULL",
    rank: 1,
    label: "Pitbull",
    emoji: "🐕‍🦺",
    description: "Intenso e direto",
  },
  {
    level: "POODLE",
    rank: 2,
    label: "Poodle",
    emoji: "🐩",
    description: "Elegante e organizado",
  },
  {
    level: "SALSICHA",
    rank: 3,
    label: "Salsicha",
    emoji: "🌭",
    description: "Único e divertido",
  },
  {
    level: "VIRALATA",
    rank: 4,
    label: "Vira-lata",
    emoji: "🐕",
    description: "Autêntico e leal",
  },
  {
    level: "CARAMELO",
    rank: 5,
    label: "Caramelo",
    emoji: "🟤",
    description: "O melhor amigo de todos",
  },
];

export const VIEW_MODES = [
  { id: "FEED", label: "Feed", description: "Estilo comunidade (Orkut)", available: true },
  { id: "INSTA", label: "Insta", description: "Grade de fotos", available: false },
  { id: "REELS", label: "Reels", description: "Vídeos curtos", available: false },
] as const;

export const LEVEL_RANK: Record<DogReputationLevel, number> = {
  PITBULL: 1,
  POODLE: 2,
  SALSICHA: 3,
  VIRALATA: 4,
  CARAMELO: 5,
};
