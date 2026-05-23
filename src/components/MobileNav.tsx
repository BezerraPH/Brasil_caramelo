"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV, isNavActive } from "@/lib/nav";
import { ChatUnreadBadge } from "./ChatUnreadBadge";
import { PetDailyNavDot } from "./PetDailyNavDot";
import { NotificationUnreadDot } from "./NotificationUnreadDot";
import { TribunalOpenDot } from "./TribunalOpenDot";

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
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition ${
                  active ? "bc-nav-link-active" : "text-bc-brown hover:text-bc-blue"
                }`}
              >
                <span className="relative text-lg" aria-hidden>
                  {tab.icon}
                  {tab.href === "/mensagens" && (
                    <ChatUnreadBadge
                      userId={userId}
                      pusherKey={pusherKey}
                      pusherCluster={pusherCluster}
                    />
                  )}
                  {tab.href === "/cachorro" && <PetDailyNavDot />}
                  {tab.href === "/explorar" && (
                    <>
                      <NotificationUnreadDot />
                      <TribunalOpenDot />
                    </>
                  )}
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
