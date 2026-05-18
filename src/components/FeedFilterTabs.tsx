"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { FeedFilterMode } from "@/lib/feed-posts";

const TABS: { mode: FeedFilterMode; label: string; hint: string }[] = [
  { mode: "all", label: "Todos", hint: "Feed completo da matilha" },
  { mode: "friends", label: "Matilha", hint: "Só quem você segue de perto" },
  { mode: "video", label: "Vídeos", hint: "Posts com vídeo" },
];

export function FeedFilterTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = (searchParams.get("filter") ?? "all") as FeedFilterMode;
  const current =
    TABS.find((t) => t.mode === active)?.mode ?? "all";

  return (
    <div
      className="mb-4 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filtrar feed"
    >
      {TABS.map((tab) => {
        const isActive = current === tab.mode;
        const href =
          tab.mode === "all"
            ? pathname
            : `${pathname}?filter=${tab.mode}`;
        return (
          <Link
            key={tab.mode}
            href={href}
            role="tab"
            aria-selected={isActive}
            title={tab.hint}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-bc-caramel text-white shadow-md shadow-bc-caramel/25"
                : "border border-bc-cream-dark bg-bc-cream/80 text-bc-brown hover:border-bc-caramel/40 hover:bg-bc-cream"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
