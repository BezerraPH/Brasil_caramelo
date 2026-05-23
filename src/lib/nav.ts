export type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Prefixos extras para destacar rota ativa (ex.: /casinha/x) */
  matchPrefixes?: string[];
};

export const DESKTOP_NAV: NavItem[] = [
  { href: "/feed", label: "Feed", icon: "📰" },
  { href: "/explorar", label: "Explorar", icon: "🧭" },
  {
    href: "/casinhas",
    label: "Casinhas",
    icon: "🏠",
    matchPrefixes: ["/casinha"],
  },
  {
    href: "/latidos",
    label: "Latidos",
    icon: "🎙️",
    matchPrefixes: ["/latidos"],
  },
  {
    href: "/tribunal",
    label: "Tribunal",
    icon: "⚖️",
    matchPrefixes: ["/tribunal"],
  },
  { href: "/ranking", label: "Matilha", icon: "🏆" },
  { href: "/rolezinho", label: "Eventos", icon: "🎉" },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/feed", label: "Início", icon: "📰" },
  { href: "/mensagens", label: "Chat", icon: "💬" },
  {
    href: "/latidos",
    label: "Latidos",
    icon: "🎙️",
    matchPrefixes: ["/latidos"],
  },
  {
    href: "/explorar",
    label: "Mais",
    icon: "🧭",
    matchPrefixes: [
      "/notificacoes",
      "/buscar",
      "/ranking",
      "/batalha",
      "/premium",
      "/rolezinho",
      "/salvos",
      "/tribunal",
      "/casinhas",
      "/casinha",
      "/amigos",
      "/configuracoes",
    ],
  },
  { href: "/cachorro", label: "Pet", icon: "🐕" },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }
  return (item.matchPrefixes ?? []).some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function navLinkClass(active: boolean): string {
  return active
    ? "bc-nav-link-active"
    : "text-bc-brown hover:bg-bc-blue/10 hover:text-bc-blue";
}
