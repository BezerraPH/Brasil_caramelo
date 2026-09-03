import type { ProfileTheme } from "@/generated/prisma/enums";

export type ProfileThemeConfig = {
  id: ProfileTheme;
  label: string;
  tagline: string;
  accent: string;
  accentSoft: string;
  banner: string;
  previewBg: string;
};

export const PROFILE_THEMES: ProfileThemeConfig[] = [
  {
    id: "CLASSIC",
    label: "Orkut Nostalgia",
    tagline: "Azul clássico anos 2000 & Ciano acolhedor",
    accent: "#0b4f8a",
    accentSoft: "#1e6091",
    banner: "linear-gradient(135deg, #004d80 0%, #0b4f8a 50%, #1e6091 100%)",
    previewBg: "#eef4f8",
  },
  {
    id: "CARAMELO",
    label: "Caramelo Raiz",
    tagline: "Dourado quente & Âmbar da matilha",
    accent: "#c68642",
    accentSoft: "#ab5d18",
    banner: "linear-gradient(135deg, #ab5d18 0%, #c68642 50%, #d49a5b 100%)",
    previewBg: "#fbf7f2",
  },
  {
    id: "TROPICAL",
    label: "Matilha Tropical",
    tagline: "Verde esmeralda & Amarelo ouro",
    accent: "#176336",
    accentSoft: "#2d8b57",
    banner: "linear-gradient(135deg, #0f4c28 0%, #176336 50%, #e6a800 100%)",
    previewBg: "#f0fdf4",
  },
  {
    id: "SUNSET",
    label: "Rosa & Pôr do Sol",
    tagline: "Magenta retrô & Laranja vibrante",
    accent: "#e11d48",
    accentSoft: "#f43f5e",
    banner: "linear-gradient(135deg, #be185d 0%, #e11d48 50%, #fb923c 100%)",
    previewBg: "#fff1f2",
  },
  {
    id: "NIGHT",
    label: "Luar Noturno",
    tagline: "Azul marinho profundo & Púrpura",
    accent: "#6366f1",
    accentSoft: "#818cf8",
    banner: "linear-gradient(135deg, #0a192f 0%, #1e1e38 50%, #4338ca 100%)",
    previewBg: "#0f172a",
  },
];

export const PROFILE_THEME_BY_ID = Object.fromEntries(
  PROFILE_THEMES.map((t) => [t.id, t]),
) as Record<ProfileTheme, ProfileThemeConfig>;
