"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/feed", label: "Início", icon: "🏠" },
  { href: "/casinhas", label: "Casas", icon: "🏡" },
  { href: "/buscar", label: "Buscar", icon: "🔍" },
  { href: "/salvos", label: "Salvos", icon: "🔖" },
  { href: "/cachorro", label: "Pet", icon: "🐕" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bc-glass fixed bottom-0 left-0 right-0 z-30 border-t border-bc-blue/15 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition ${
                  active
                    ? "bg-bc-green/15 text-bc-green"
                    : "text-bc-brown hover:text-bc-blue"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
