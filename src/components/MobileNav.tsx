"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV, isNavActive } from "@/lib/nav";
import { PetDailyNavDot } from "./PetDailyNavDot";
import { TribunalOpenDot } from "./TribunalOpenDot";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bc-glass fixed bottom-0 left-0 right-0 z-30 border-t border-bc-blue/15 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-lg justify-around px-1 py-2">
        {MOBILE_NAV.map((tab) => {
          const active = isNavActive(pathname, tab);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition ${
                  active ? "bc-nav-link-active" : "text-bc-brown hover:text-bc-blue"
                }`}
              >
                <span className="relative text-lg" aria-hidden>
                  {tab.icon}
                  {tab.href === "/cachorro" && <PetDailyNavDot />}
                  {tab.href === "/explorar" && <TribunalOpenDot />}
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
