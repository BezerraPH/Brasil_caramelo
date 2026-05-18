"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function FeedFilterTabs() {
  const searchParams = useSearchParams();
  const friends = searchParams.get("filter") === "friends";

  return (
    <div className="bc-feed-filters mb-4 flex gap-2">
      <Link
        href="/feed"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          !friends
            ? "bc-nav-link-active"
            : "border border-bc-blue/15 text-bc-brown hover:bg-bc-blue/8"
        }`}
      >
        🌐 Todos
      </Link>
      <Link
        href="/feed?filter=friends"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          friends
            ? "bc-nav-link-active"
            : "border border-bc-blue/15 text-bc-brown hover:bg-bc-blue/8"
        }`}
      >
        🐕 Só matilha
      </Link>
    </div>
  );
}
