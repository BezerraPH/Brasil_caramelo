"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DESKTOP_NAV, isNavActive, navLinkClass } from "@/lib/nav";
import { LogoutButton } from "./LogoutButton";
import { ChatUnreadBadge } from "./ChatUnreadBadge";
import { PetDailyNavDot } from "./PetDailyNavDot";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { TribunalOpenDot } from "./TribunalOpenDot";
import { NostrRelayStatus } from "./nostr/NostrRelayStatus";

type NavBarProps = {
  user: { id: string; name: string; username: string };
  pusherKey?: string | null;
  pusherCluster?: string | null;
};

export function NavBar({ user, pusherKey, pusherCluster }: NavBarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bc-nav-brasil bc-glass sticky top-0 z-40 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/feed"
          className="flex items-center gap-2 transition hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-bc-caramel/50 to-bc-green/30 text-lg shadow-sm">
            🐕
          </span>
          <span className="hidden sm:inline">
            <span className="text-base font-extrabold text-bc-blue">
              Brasil <span className="text-bc-caramel">Caramelo</span>
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {DESKTOP_NAV.map((link) => {
            const active = isNavActive(pathname, link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition ${navLinkClass(active)}`}
              >
                <span className="mr-1" aria-hidden>
                  {link.icon}
                </span>
                {link.label}
                {link.href === "/tribunal" && <TribunalOpenDot />}
              </Link>
            );
          })}
          <Link
            href="/cachorro"
            className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition ${navLinkClass(
              pathname.startsWith("/cachorro"),
            )}`}
          >
            <span className="relative mr-1 inline-block" aria-hidden>
              🐕
              <PetDailyNavDot />
            </span>
            Pet
          </Link>
          <Link
            href={`/perfil/${user.username}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${navLinkClass(
              pathname === `/perfil/${user.username}` ||
                pathname.startsWith(`/perfil/${user.username}/`),
            )}`}
          >
            Perfil
          </Link>
          <Link href="/configuracoes" className="bc-btn-ghost hidden lg:inline">
            Editar
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/mensagens"
            className={`relative rounded-lg p-2 transition hover:bg-bc-blue/10 ${navLinkClass(
              pathname.startsWith("/mensagens"),
            )}`}
            aria-label="Mensagens"
          >
            💬
            <ChatUnreadBadge
              userId={user.id}
              pusherKey={pusherKey}
              pusherCluster={pusherCluster}
            />
          </Link>
          <NostrRelayStatus />
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
        <nav className="bc-menu-enter border-t border-bc-blue/10 bg-bc-white px-4 py-3 md:hidden dark:bg-[var(--background)]">
          <ul className="space-y-1">
            {DESKTOP_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${navLinkClass(
                    isNavActive(pathname, link),
                  )}`}
                >
                  {link.icon} {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/mensagens"
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${navLinkClass(
                  pathname.startsWith("/mensagens"),
                )}`}
              >
                💬 Mensagens
              </Link>
            </li>
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
