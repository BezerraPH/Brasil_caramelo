"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV, isNavActive } from "@/lib/nav";
import { ChatUnreadBadge } from "./ChatUnreadBadge";
import { NotificationUnreadDot } from "./NotificationUnreadDot";
import { PetMiniWidget } from "./PetMiniWidget";

type MobileNavProps = {
  userId: string;
  pusherKey?: string | null;
  pusherCluster?: string | null;
};

export function MobileNav({
  userId,
  pusherKey,
  pusherCluster,
}: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="bc-glass fixed bottom-0 left-0 right-0 z-30 border-t border-bc-blue/15 bg-bc-white/95 pb-[env(safe-area-inset-bottom)] md:hidden shadow-lg backdrop-blur-lg"
      aria-label="Navegação principal mobile"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {MOBILE_NAV.map((tab) => {
          const isCreate = tab.label === "Criar";
          const active = isNavActive(pathname, tab);

          if (isCreate) {
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-bc-caramel to-bc-green text-white shadow-md transition active:scale-95"
                  aria-label="Criar nova publicação"
                >
                  <span className="text-xl font-bold">＋</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                  active
                    ? "text-bc-green"
                    : "text-bc-brown/80 hover:text-bc-blue"
                }`}
              >
                <span className="relative text-xl" aria-hidden>
                  {tab.icon}
                  {tab.href === "/mensagens" && (
                    <ChatUnreadBadge
                      userId={userId}
                      pusherKey={pusherKey}
                      pusherCluster={pusherCluster}
                    />
                  )}
                  {tab.href === "/explorar" && <NotificationUnreadDot />}
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <PetMiniWidget />
        </li>
      </ul>
    </nav>
  );
}
