import type { getMatilhaStats } from "./matilha-stats";

type MatilhaStats = Awaited<ReturnType<typeof getMatilhaStats>>;

export const MATILHA_STAT_ITEMS: {
  key: keyof MatilhaStats;
  icon: string;
  label: string;
  colorClass: string;
}[] = [
  { key: "users", icon: "🐕", label: "Cachorreiros", colorClass: "text-bc-blue" },
  { key: "posts", icon: "📰", label: "Recados", colorClass: "text-bc-green" },
  { key: "pets", icon: "🦴", label: "Pets ativos", colorClass: "text-bc-brown" },
  { key: "boosted", icon: "🚀", label: "Em destaque", colorClass: "text-bc-caramel" },
  { key: "mirrors", icon: "🌐", label: "Federados", colorClass: "text-bc-gold" },
];
