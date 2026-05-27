export type HubItem = {
  href: string;
  icon: string;
  title: string;
  desc: string;
};

export type HubSection = {
  id: string;
  title: string;
  emoji: string;
  items: HubItem[];
};

export const EXPLORAR_HUB: HubSection[] = [
  {
    id: "conteudo",
    title: "Conteúdo",
    emoji: "📰",
    items: [
      { href: "/feed", icon: "📰", title: "Feed & Cinelar FYP", desc: "Recados, Insta e For You" },
      { href: "/matilhas", icon: "🐾", title: "Matilhas", desc: "Fórum, enquetes e eventos" },
      { href: "/fotos", icon: "📷", title: "Fotos", desc: "Álbuns estilo Orkut" },
      { href: "/depoimentos", icon: "💬", title: "Depoimentos", desc: "Inbox estilo Orkut" },
      { href: "/casinhas", icon: "🏠", title: "Casinhas", desc: "10 comunidades por raça" },
      { href: "/buscar", icon: "🔍", title: "Buscar", desc: "Pessoas, recados e #tags" },
      { href: "/salvos", icon: "🔖", title: "Salvos", desc: "Recados favoritos" },
    ],
  },
  {
    id: "social",
    title: "Social",
    emoji: "🤝",
    items: [
      { href: "/amigos", icon: "🤝", title: "Amigos", desc: "Matilha social" },
      { href: "/mensagens", icon: "💬", title: "Mensagens", desc: "Chat ao vivo" },
      { href: "/notificacoes", icon: "🔔", title: "Notificações", desc: "Tudo da matilha" },
    ],
  },
  {
    id: "diversao",
    title: "Diversão",
    emoji: "🎉",
    items: [
      { href: "/ranking", icon: "🏆", title: "Ranking", desc: "Top da semana" },
      { href: "/batalha", icon: "⚔️", title: "Batalha", desc: "Votação de fofura" },
      { href: "/rolezinho", icon: "🎉", title: "Rolezinho", desc: "Eventos 2x moedas" },
      { href: "/latidos", icon: "🎙️", title: "Latidos ao Vivo", desc: "Áudio por casinha" },
      { href: "/tribunal", icon: "⚖️", title: "Tribunal do Cão", desc: "Mediação gamificada" },
      { href: "/cachorro", icon: "🐕", title: "Meu pet", desc: "Cuidar, buscar e loja" },
      { href: "/premium", icon: "👑", title: "Pedigree", desc: "Apoiar o projeto" },
    ],
  },
];
