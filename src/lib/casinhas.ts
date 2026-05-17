import type { DogReputationLevel } from "@/generated/prisma/enums";
import { REPUTATION_BY_LEVEL } from "./constants";

export type CasinhaConfig = {
  level: DogReputationLevel;
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  accent: string;
  gradient: string;
  rules: string;
};

export const CASINHAS: CasinhaConfig[] = [
  {
    level: "PITBULL",
    slug: "pitbull",
    name: "Toca dos Pitbulls",
    tagline: "Papo reto, sem enrolação",
    emoji: "🐕‍🦺",
    accent: "#8b2942",
    gradient: "from-[#8b2942]/20 to-bc-blue/10",
    rules: "Conteúdo direto e intenso. Zoeira pesada com respeito.",
  },
  {
    level: "HUSKY",
    slug: "husky",
    name: "Palco do Husky",
    tagline: "Drama autorizado",
    emoji: "🐺",
    accent: "#4a90c2",
    gradient: "from-[#4a90c2]/25 to-bc-green/10",
    rules: "Reclamações, memes dramáticos e histórias épicas.",
  },
  {
    level: "CARAMELO",
    slug: "caramelo",
    name: "Boteco do Caramelo",
    tagline: "Tamo junto na raiz",
    emoji: "🟤",
    accent: "#c68642",
    gradient: "from-bc-caramel/30 to-bc-brown/10",
    rules: "Memes BR, resenha de boteco e solidariedade.",
  },
  {
    level: "POODLE",
    slug: "poodle",
    name: "SPA dos Poodles",
    tagline: "Estética impecável",
    emoji: "🐩",
    accent: "#5c4d7a",
    gradient: "from-[#9b8ab8]/20 to-bc-white",
    rules: "Fotos limpas, vibes elegantes, zero bagunça.",
  },
  {
    level: "PINSCHER",
    slug: "pinscher",
    name: "Arena do Pinscher",
    tagline: "220v de opinião",
    emoji: "⚡",
    accent: "#d4a017",
    gradient: "from-[#d4a017]/20 to-bc-caramel/10",
    rules: "Debates rápidos. Comentou, debateu.",
  },
  {
    level: "GOLDEN",
    slug: "golden",
    name: "Parque Golden",
    tagline: "Só energia boa",
    emoji: "🌟",
    accent: "#e8a317",
    gradient: "from-[#e8a317]/25 to-bc-green/15",
    rules: "Positividade, elogios e fotos fofas.",
  },
  {
    level: "VIRALATA",
    slug: "viralata",
    name: "Quiosque Vira-lata",
    tagline: "Low profile total",
    emoji: "🐕",
    accent: "#6b7c5c",
    gradient: "from-bc-green/10 to-bc-brown/10",
    rules: "Conteúdo relax, imperfeito e autêntico.",
  },
  {
    level: "BORDER_COLLIE",
    slug: "border-collie",
    name: "Hub Border Collie",
    tagline: "Produtividade canina",
    emoji: "🎯",
    accent: "#2d5a4a",
    gradient: "from-bc-green/20 to-bc-blue/10",
    rules: "Dicas, tutoriais e hacks do dia a dia.",
  },
  {
    level: "BASSET_HOUND",
    slug: "basset",
    name: "Sofá Basset",
    tagline: "Só observando",
    emoji: "😴",
    accent: "#8b6914",
    gradient: "from-bc-brown/15 to-bc-caramel/10",
    rules: "Pouco texto, muita observação. Preguiça permitida.",
  },
  {
    level: "CHOW_CHOW",
    slug: "chow",
    name: "Salão Chow",
    tagline: "Exclusivo e frio",
    emoji: "🧊",
    accent: "#7a4a3a",
    gradient: "from-[#5c3d32]/15 to-bc-blue/5",
    rules: "Conteúdo seletivo. Qualidade > quantidade.",
  },
];

export const CASINHA_BY_SLUG = Object.fromEntries(
  CASINHAS.map((c) => [c.slug, c]),
) as Record<string, CasinhaConfig>;

export const CASINHA_BY_LEVEL = Object.fromEntries(
  CASINHAS.map((c) => [c.level, c]),
) as Record<DogReputationLevel, CasinhaConfig>;

export function getCasinhaLabel(level: DogReputationLevel) {
  return REPUTATION_BY_LEVEL[level]?.breed ?? level;
}
