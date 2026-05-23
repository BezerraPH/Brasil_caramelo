export const ACHIEVEMENTS = {
  DAILY_STREAK_7: {
    key: "DAILY_STREAK_7",
    title: "Dono exemplar",
    emoji: "🏅",
    desc: "7 dias seguidos de missão diária",
  },
  BATTLE_CHAMP_5: {
    key: "BATTLE_CHAMP_5",
    title: "Rei da Matilha",
    emoji: "👑",
    desc: "Venceu 5 batalhas de fofura",
  },
  CASINHA_FIRST: {
    key: "CASINHA_FIRST",
    title: "Cidadão da Casinha",
    emoji: "🏠",
    desc: "Primeiro recado em uma casinha",
  },
  POST_BOOST_FIRST: {
    key: "POST_BOOST_FIRST",
    title: "Anunciante",
    emoji: "🚀",
    desc: "Impulsionou um recado pela primeira vez",
  },
  CINELAR_FIRST: {
    key: "CINELAR_FIRST",
    title: "Estreia no Cinelar",
    emoji: "🎬",
    desc: "Publicou o primeiro vídeo curto",
  },
  FEDERATION_SYNC: {
    key: "FEDERATION_SYNC",
    title: "Matilha conectada",
    emoji: "🌐",
    desc: "Sincronizou recados de outro servidor",
  },
  BREEDER_5: {
    key: "BREEDER_5",
    title: "Criador da Matilha",
    emoji: "🧬",
    desc: "Gerou 5 filhotes via DNA Caramelo",
  },
  TRIBUNAL_JUROR: {
    key: "TRIBUNAL_JUROR",
    title: "Juiz da Matilha",
    emoji: "⚖️",
    desc: "Votou no Tribunal do Cão pela primeira vez",
  },
  LATIDOS_FIRST: {
    key: "LATIDOS_FIRST",
    title: "Voz da matilha",
    emoji: "🎙️",
    desc: "Entrou em uma sala Latidos ao Vivo",
  },
} as const;

export type AchievementKey = keyof typeof ACHIEVEMENTS;

export function formatAchievementToast(key: AchievementKey): string {
  const a = ACHIEVEMENTS[key];
  return `${a.emoji} Conquista: ${a.title}`;
}
