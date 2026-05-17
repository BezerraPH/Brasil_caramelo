"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

type NavBarProps = {
  user: { id: string; name: string; username: string };
  pusherKey?: string | null;
  pusherCluster?: string | null;
};

const LINKS = [
  { href: "/feed", label: "Feed", icon: "📰" },
  { href: "/explorar", label: "Explorar", icon: "🧭" },
  { href: "/casinhas", label: "Casinhas", icon: "🏠" },
  { href: "/ranking", label: "Matilha", icon: "🏆" },
  { href: "/rolezinho", label: "Eventos", icon: "🎉" },
] as const;

export function NavBar({ user, pusherKey, pusherCluster }: NavBarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bc-glass sticky top-0 z-40 border-b-2 border-bc-blue/15 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/feed"
          className="flex items-center gap-2 transition hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-bc-caramel/50 to-bc-green/30 text-lg shadow-sm">
            🐕
          </span>
          <span className="hidden font-bold text-bc-blue sm:inline">
            Brasil <span className="text-bc-brown">Caramelo</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-bc-green/15 text-bc-green"
                  : "text-bc-brown hover:bg-bc-blue/10 hover:text-bc-blue"
              }`}
            >
              <span className="mr-1" aria-hidden>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
          <Link
            href={`/perfil/${user.username}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              pathname === `/perfil/${user.username}`
                ? "bg-bc-blue/15 text-bc-blue"
                : "text-bc-blue hover:bg-bc-blue/10"
            }`}
          >
            Perfil
          </Link>
          <Link
            href="/configuracoes"
            className="bc-btn-ghost hidden lg:inline"
          >
            Editar
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell
            userId={user.id}
            pusherKey={pusherKey}
            pusherCluster={pusherCluster}
          />
          <span className="hidden max-w-[90px] truncate text-xs text-bc-brown md:inline">
            @{user.username}
          </span>
          <button
            type="button"
            className="rounded-lg p-2 text-bc-blue md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <div className="hidden md:block">
            <LogoutButton />
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="bc-menu-enter border-t border-bc-blue/10 bg-bc-white px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-bc-blue hover:bg-bc-green/10"
                >
                  {link.icon} {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/perfil/${user.username}`}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-bc-blue"
              >
                👤 Perfil
              </Link>
            </li>
            <li>
              <Link
                href="/configuracoes"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-bc-brown"
              >
                ⚙️ Editar perfil
              </Link>
            </li>
            <li className="pt-2">
              <LogoutButton />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
