"use client";

import Link from "next/link";

const SHORTCUTS = [
  { href: "/buscar", icon: "🔍", label: "Buscar" },
  { href: "/notificacoes", icon: "🔔", label: "Alertas" },
  { href: "/casinhas", icon: "🏠", label: "Casas" },
  { href: "/batalha", icon: "⚔️", label: "Batalha" },
  { href: "/amigos", icon: "🤝", label: "Amigos" },
] as const;

export function FeedQuickDock() {
  return (
    <nav
      className="bc-quick-dock bc-animate-in mb-4 md:hidden"
      aria-label="Atalhos rápidos"
    >
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {SHORTCUTS.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="bc-quick-dock-item"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            </li>
        ))}
      </ul>
    </nav>
  );
}
