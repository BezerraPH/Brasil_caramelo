"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserAvatar } from "./UserAvatar";
import { PetDailyNavDot } from "./PetDailyNavDot";
import { TribunalOpenDot } from "./TribunalOpenDot";
import { SoundToggle } from "./SoundToggle";
import { NostrRelayStatus } from "./nostr/NostrRelayStatus";
import { LogoutButton } from "./LogoutButton";
import { useTheme } from "./ThemeProvider";

type UserDropdownMenuProps = {
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    isPremium?: boolean;
  };
};

export function UserDropdownMenu({ user }: UserDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toggle: toggleTheme, isLuar } = useTheme();

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Trigger com Avatar e Nome */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-bc-caramel/20 bg-bc-white/80 py-1 pl-1 pr-3 transition hover:bg-bc-blue/10 hover:border-bc-blue/30 focus:outline-none focus:ring-2 focus:ring-bc-blue/30 shadow-xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu do Usuário"
      >
        <UserAvatar
          name={user.name || user.username}
          avatarUrl={user.avatarUrl}
          size="sm"
          isPremium={user.isPremium}
        />
        <div className="hidden text-left sm:block">
          <span className="block max-w-[100px] truncate text-xs font-black text-bc-blue leading-tight">
            {user.name || user.username}
          </span>
          <span className="block max-w-[100px] truncate text-[10px] font-semibold text-bc-brown/70 leading-tight">
            @{user.username}
          </span>
        </div>
        <span className={`text-xs text-bc-brown/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {/* Menu Flutuante Elegante */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-bc-caramel/25 bg-bc-white p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150 dark:bg-slate-900 dark:border-white/10"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header do Menu */}
          <div className="mb-2 rounded-xl bg-gradient-to-r from-bc-caramel/15 via-bc-blue/10 to-bc-green/10 p-3">
            <p className="text-xs font-bold text-bc-brown/80 uppercase tracking-wider">Conectado como</p>
            <p className="text-sm font-black text-bc-blue truncate">{user.name}</p>
            <p className="text-xs font-semibold text-bc-brown/80 truncate">@{user.username}</p>
          </div>

          {/* Links Principais */}
          <div className="space-y-1 py-1 text-sm font-medium">
            <Link
              href={`/perfil/${user.username}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-bc-brown transition hover:bg-bc-blue/10 hover:text-bc-blue font-semibold"
              role="menuitem"
            >
              <span>👤</span>
              <span>Meu Perfil (Orkut)</span>
            </Link>

            <Link
              href="/cachorro"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-bc-brown transition hover:bg-bc-blue/10 hover:text-bc-blue font-semibold"
              role="menuitem"
            >
              <span className="flex items-center gap-2.5">
                <span>🐕</span>
                <span>Meu Pet Diário</span>
              </span>
              <PetDailyNavDot />
            </Link>

            <Link
              href="/tribunal"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-bc-brown transition hover:bg-bc-blue/10 hover:text-bc-blue font-semibold"
              role="menuitem"
            >
              <span className="flex items-center gap-2.5">
                <span>⚖️</span>
                <span>Tribunal da Matilha</span>
              </span>
              <TribunalOpenDot />
            </Link>

            <Link
              href="/nostr"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-bc-brown transition hover:bg-bc-blue/10 hover:text-bc-blue font-semibold"
              role="menuitem"
            >
              <span>⚡</span>
              <span>Modo Livre Nostr</span>
            </Link>

            <Link
              href="/configuracoes?tab=aparencia"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-bc-brown transition hover:bg-bc-blue/10 hover:text-bc-blue font-semibold"
              role="menuitem"
            >
              <span>🎨</span>
              <span>Personalizar Cores</span>
            </Link>

            <Link
              href="/configuracoes"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-bc-brown transition hover:bg-bc-blue/10 hover:text-bc-blue font-semibold"
              role="menuitem"
            >
              <span>⚙️</span>
              <span>Configurações</span>
            </Link>
          </div>

          <hr className="my-2 border-bc-caramel/20 dark:border-white/10" />

          {/* Controles Rápidos de Ambiente */}
          <div className="space-y-2 rounded-xl bg-bc-sand/20 p-2.5 dark:bg-white/5 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-bc-brown/80">Tema de Luz:</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1 rounded-lg border border-bc-caramel/25 bg-bc-white px-2.5 py-1 text-xs font-bold text-bc-blue transition hover:bg-bc-blue/10 shadow-2xs dark:bg-slate-800"
              >
                {isLuar ? "🌙 Luar" : "☀️ Claro"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-bc-brown/80">Efeitos Sonoros:</span>
              <SoundToggle />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-bc-brown/80">Rede Nostr:</span>
              <NostrRelayStatus />
            </div>
          </div>

          <hr className="my-2 border-bc-caramel/20 dark:border-white/10" />

          {/* Botão de Logout */}
          <div className="pt-1 flex justify-end">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
