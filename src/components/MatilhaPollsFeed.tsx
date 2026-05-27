"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { ThreadPollCard } from "@/components/ThreadPollCard";
import type { PollResults } from "@/lib/thread-poll";

type PollFeedItem = {
  threadId: string;
  threadTitle: string;
  poll: PollResults;
};

type MatilhaPollsFeedProps = {
  slug: string;
};

/** Enquetes ativas no topo da Matilha (feed de enquetes). */
export function MatilhaPollsFeed({ slug }: MatilhaPollsFeedProps) {
  const [items, setItems] = useState<PollFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/packs/${slug}/polls-feed`);
    const data = await res.json();
    if (res.ok) setItems(data.items ?? []);
    setLoading(false);
  }, [slug]);

  useAsyncEffect(load, [load]);

  if (loading || items.length === 0) return null;

  return (
    <section className="bc-orkut-card bc-animate-in space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-bc-blue">📊 Enquetes da Matilha</h2>
        <span className="text-xs text-bc-brown">{items.length} ativa(s)</span>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.threadId}
            className="rounded-xl border border-bc-blue/15 bg-bc-white/80 p-3"
          >
            <Link
              href={`/matilhas/topico/${item.threadId}`}
              className="mb-2 block text-sm font-semibold text-bc-blue hover:underline"
            >
              {item.threadTitle}
            </Link>
            <ThreadPollCard
              threadId={item.threadId}
              initial={item.poll}
              archived={false}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
