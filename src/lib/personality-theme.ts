import type { DogReputationLevel } from "@/generated/prisma/enums";

export type PersonalityTheme = {
  accent: string;
  accentSoft: string;
  border: string;
  glow: string;
  pattern: string;
  label: string;
};

export const PERSONALITY_THEMES: Record<DogReputationLevel, PersonalityTheme> = {
  PITBULL: {
    accent: "#8b2942",
    accentSoft: "#8b294220",
    border: "#8b2942",
    glow: "0 0 20px rgba(139, 41, 66, 0.25)",
    pattern: "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(139,41,66,0.04) 8px, rgba(139,41,66,0.04) 16px)",
    label: "intenso",
  },
  HUSKY: {
    accent: "#4a90c2",
    accentSoft: "#4a90c225",
    border: "#6eb5e8",
    glow: "0 0 18px rgba(110, 181, 232, 0.35)",
    pattern: "repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(110,181,232,0.06) 12px, rgba(110,181,232,0.06) 24px)",
    label: "dramático",
  },
  CARAMELO: {
    accent: "#c68642",
    accentSoft: "#c6864230",
    border: "#8b5e3c",
    glow: "0 4px 24px rgba(198, 134, 66, 0.2)",
    pattern: "radial-gradient(circle at 20% 80%, rgba(198,134,66,0.08), transparent 50%)",
    label: "raiz",
  },
  POODLE: {
    accent: "#5c4d7a",
    accentSoft: "#5c4d7a18",
    border: "#9b8ab8",
    glow: "0 0 16px rgba(155, 138, 184, 0.2)",
    pattern: "linear-gradient(135deg, rgba(155,138,184,0.05) 0%, transparent 60%)",
    label: "elegante",
  },
  PINSCHER: {
    accent: "#d4a017",
    accentSoft: "#d4a01725",
    border: "#b8860b",
    glow: "0 0 12px rgba(212, 160, 23, 0.4)",
    pattern: "repeating-linear-gradient(0deg, rgba(212,160,23,0.05) 0px, rgba(212,160,23,0.05) 2px, transparent 2px, transparent 6px)",
    label: "elétrico",
  },
  GOLDEN: {
    accent: "#e8a317",
    accentSoft: "#e8a31722",
    border: "#daa520",
    glow: "0 0 20px rgba(232, 163, 23, 0.25)",
    pattern: "radial-gradient(circle at 80% 20%, rgba(232,163,23,0.1), transparent 40%)",
    label: "alegre",
  },
  VIRALATA: {
    accent: "#6b7c5c",
    accentSoft: "#6b7c5c20",
    border: "#8b9a7d",
    glow: "none",
    pattern: "none",
    label: "relax",
  },
  BORDER_COLLIE: {
    accent: "#2d5a4a",
    accentSoft: "#2d5a4a18",
    border: "#2d8b57",
    glow: "0 0 14px rgba(45, 139, 87, 0.2)",
    pattern: "linear-gradient(180deg, rgba(45,139,87,0.04), transparent)",
    label: "focado",
  },
  BASSET_HOUND: {
    accent: "#8b6914",
    accentSoft: "#8b691418",
    border: "#a08040",
    glow: "none",
    pattern: "none",
    label: "calmo",
  },
  CHOW_CHOW: {
    accent: "#7a4a3a",
    accentSoft: "#7a4a3a20",
    border: "#5c3d32",
    glow: "0 2px 12px rgba(92, 61, 50, 0.15)",
    pattern: "linear-gradient(160deg, rgba(92,61,50,0.06), transparent)",
    label: "reservado",
  },
};

export function getPersonalityTheme(
  level: DogReputationLevel | null | undefined,
): PersonalityTheme | null {
  if (!level) return null;
  return PERSONALITY_THEMES[level] ?? null;
}
