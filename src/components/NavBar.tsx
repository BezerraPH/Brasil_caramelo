"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DESKTOP_NAV, isNavActive } from "@/lib/nav";
import { ChatUnreadBadge } from "./ChatUnreadBadge";
import { NotificationBell } from "./NotificationBell";
import { UserDropdownMenu } from "./UserDropdownMenu";

type NavBarProps = {
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    isPremium?: boolean;
  };
  pusherKey?: string | null;
  pusherCluster?: string | null;
};

export function NavBar({ user, pusherKey, pusherCluster }: NavBarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bc-nav-brasil bc-glass sticky top-0 z-40 border-b border-bc-caramel/15 backdrop-blur-md transition-colors shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        
        {/* Lado Esquerdo: Logo & Identidade */}
        <Link
          href="/feed"
          className="group flex items-center gap-2.5 transition duration-150 hover:opacity-90"
          aria-label="Brasil Caramelo - Início"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-bc-caramel/40 via-bc-gold/30 to-bc-blue/20 text-xl shadow-xs transition duration-200 group-hover:scale-105 group-hover:rotate-6">
            🐕
          </span>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-bc-blue leading-tight">
              Brasil <span className="text-bc-caramel">Caramelo</span>
            </span>
            <span className="text-[10px] font-bold text-bc-brown/70 tracking-wider uppercase">
              A Rede Social do Brasil
            </span>
          </div>
        </Link>

        {/* Centro: Navegação Principal Desktop (Clean Pills) */}
        <nav className="hidden items-center gap-1.5 rounded-full border border-bc-caramel/20 bg-bc-white/60 p-1.5 backdrop-blur-sm md:flex shadow-2xs dark:bg-slate-900/60 dark:border-white/10">
          {DESKTOP_NAV.map((link) => {
            const active = isNavActive(pathname, link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-bc-blue to-bc-blue/90 text-white shadow-xs"
                    : "text-bc-brown hover:bg-bc-blue/10 hover:text-bc-blue"
                }`}
              >
                <span aria-hidden>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Lado Direito: Mensagens, Notificações e Menu do Usuário */}
        <div className="flex items-center gap-2">
          {/* Botão de Mensagens / Chat */}
          <Link
            href="/mensagens"
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-bc-caramel/20 bg-bc-white/80 text-base transition hover:bg-bc-blue/10 hover:border-bc-blue/40 shadow-2xs dark:bg-slate-900 dark:border-white/10 ${
              pathname.startsWith("/mensagens") ? "border-bc-blue bg-bc-blue/15 text-bc-blue ring-2 ring-bc-blue/20" : "text-bc-brown"
            }`}
            aria-label="Mensagens e Chat"
          >
            <span aria-hidden>💬</span>
            <ChatUnreadBadge
              userId={user.id}
              pusherKey={pusherKey}
              pusherCluster={pusherCluster}
            />
          </Link>

          {/* Sino de Notificações */}
          <NotificationBell
            userId={user.id}
            pusherKey={pusherKey}
            pusherCluster={pusherCluster}
          />

          {/* Menu Dropdown do Usuário (Centraliza Perfil, Pet, Cores, Nostr, Tema, Logout) */}
          <UserDropdownMenu user={user} />

          {/* Botão Hambúrguer Mobile */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-bc-caramel/20 bg-bc-white/80 text-bc-blue md:hidden shadow-2xs dark:bg-slate-900"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Abrir Menu de Navegação"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Drawer / Menu Mobile Retrátil */}
      {mobileMenuOpen && (
        <nav className="border-t border-bc-caramel/15 bg-bc-white/95 px-4 py-3 backdrop-blur-md md:hidden animate-in slide-in-from-top-2 duration-150 dark:bg-slate-900/95">
          <div className="space-y-1">
            {DESKTOP_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                  isNavActive(pathname, link)
                    ? "bg-bc-blue text-white shadow-xs"
                    : "text-bc-brown hover:bg-bc-blue/10 hover:text-bc-blue"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
