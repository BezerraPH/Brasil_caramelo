export type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Prefixos extras para destacar rota ativa (ex.: /casinha/x) */
  matchPrefixes?: string[];
};

export const DESKTOP_NAV: NavItem[] = [
  { href: "/feed", label: "Início", icon: "📰" },
  {
    href: "/explorar",
    label: "Explorar",
    icon: "🧭",
    matchPrefixes: [
      "/buscar",
      "/ranking",
      "/batalha",
      "/rolezinho",
      "/tribunal",
      "/latidos",
      "/pet-shops",
      "/salvos",
    ],
  },
  { href: "/nostr", label: "Modo Livre ⚡", icon: "⚡", matchPrefixes: ["/nostr"] },
  {
    href: "/casinhas",
    label: "Casinhas",
    icon: "🏠",
    matchPrefixes: ["/casinha", "/comunidades", "/matilhas"],
  },
  { href: "/cachorro", label: "Pet", icon: "🐕", matchPrefixes: ["/cachorro"] },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/feed", label: "Início", icon: "📰" },
  {
    href: "/explorar",
    label: "Explorar",
    icon: "🧭",
    matchPrefixes: [
      "/notificacoes",
      "/buscar",
      "/ranking",
      "/batalha",
      "/premium",
      "/pet-shops",
      "/rolezinho",
      "/salvos",
      "/tribunal",
      "/casinhas",
      "/casinha",
      "/latidos",
      "/amigos",
      "/comunidades",
      "/matilhas",
    ],
  },
  { href: "/feed?criar=1", label: "Criar", icon: "➕" },
  { href: "/mensagens", label: "Chat", icon: "💬", matchPrefixes: ["/mensagens"] },
  { href: "/perfil", label: "Perfil", icon: "👤", matchPrefixes: ["/perfil", "/configuracoes"] },
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
