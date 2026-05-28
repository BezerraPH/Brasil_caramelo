/** Tipos e constantes compartilhados — seguro para Client Components. */

export type CommunityCard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  themePrimary: string;
  themeAccent: string;
  memberCount: number;
  packSlug: string | null;
  isMember: boolean;
};

export const COMMUNITY_CATEGORIES = [
  { id: "todos", label: "Todas" },
  { id: "musica", label: "Música" },
  { id: "pets", label: "Pets" },
  { id: "games", label: "Games" },
  { id: "esportes", label: "Esportes" },
  { id: "humor", label: "Humor" },
  { id: "outros", label: "Outros" },
] as const;
