import type { ProfileTheme } from "@/generated/prisma/enums";

export type ProfileThemeConfig = {
  id: ProfileTheme;
  label: string;
  accent: string;
  accentSoft: string;
  banner: string;
};

export const PROFILE_THEMES: ProfileThemeConfig[] = [
  {
    id: "CLASSIC",
    label: "Clássico Matilha",
    accent: "#1e4d8c",
    accentSoft: "#2d8b57",
    banner: "linear-gradient(120deg, #1e4d8c 0%, #2d8b57 50%, #c68642 100%)",
  },
  {
    id: "SUNSET",
    label: "Pôr do Sol",
    accent: "#e85d04",
    accentSoft: "#9d4edd",
    banner: "linear-gradient(120deg, #ff6b35 0%, #f72585 45%, #7209b7 100%)",
  },
  {
    id: "TROPICAL",
    label: "Tropical",
    accent: "#2d8b57",
    accentSoft: "#f4d35e",
    banner: "linear-gradient(120deg, #2d8b57 0%, #f4d35e 50%, #06d6a0 100%)",
  },
  {
    id: "CARAMELO",
    label: "Caramelo Raiz",
    accent: "#c68642",
    accentSoft: "#8b5e3c",
    banner: "linear-gradient(120deg, #c68642 0%, #8b5e3c 60%, #2d8b57 100%)",
  },
  {
    id: "NIGHT",
    label: "Noite na Matilha",
    accent: "#4a4e69",
    accentSoft: "#9a8c98",
    banner: "linear-gradient(120deg, #22223b 0%, #4a4e69 50%, #9a8c98 100%)",
  },
];

export const PROFILE_THEME_BY_ID = Object.fromEntries(
  PROFILE_THEMES.map((t) => [t.id, t]),
) as Record<ProfileTheme, ProfileThemeConfig>;
