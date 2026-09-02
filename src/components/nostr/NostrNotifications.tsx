"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { getNostrPool } from "@/lib/nostr/relays";
import { shortenNpub } from "@/lib/nostr/keys";
import type { NostrEvent, NostrProfileMetadata } from "@/lib/nostr/types";

export function NostrNotifications() {
  const { identity, relays } = useNostrAuth();
  const [notifications, setNotifications] = useState<NostrEvent[]>([]);
  const [profiles, setProfiles] = useState<Record<string, NostrProfileMetadata>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!identity?.pubkey || typeof window === "undefined") {
      return;
    }

    const pool = getNostrPool();
    const rawEvents: NostrEvent[] = [];

    // Buscar eventos onde fui mencionado (Kinds 1 e 7 com tag p = meu pubkey)
    const sub = pool.subscribeMany(
      relays,
      {
        kinds: [1, 7],
        "#p": [identity.pubkey],
        limit: 30,
      },
      {
        onevent(event: NostrEvent) {
          // Ignorar eventos que eu mesmo criei
          if (event.pubkey === identity.pubkey) return;

          if (!rawEvents.some((e) => e.id === event.id)) {
            rawEvents.push(event);
            rawEvents.sort((a, b) => b.created_at - a.created_at);
            setNotifications([...rawEvents]);

            // Buscar perfil do autor
            pool
              .get(relays, { kinds: [0], authors: [event.pubkey] })
              .then((profEvent) => {
                if (profEvent?.content) {
                  try {
                    const parsed = JSON.parse(profEvent.content) as NostrProfileMetadata;
                    setProfiles((prev) => ({ ...prev, [event.pubkey]: parsed }));
                  } catch {
                    // ignore
                  }
                }
              })
              .catch(() => null);
          }
        },
        oneose() {
          setLoading(false);
        },
      },
    );

    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
      sub.close();
    };
  }, [identity?.pubkey, relays]);

  if (!identity) {
    return (
      <div className="bc-card rounded-2xl border border-bc-caramel/20 bg-bc-white p-8 text-center">
        <p className="text-2xl">🔔</p>
        <p className="mt-2 text-sm font-bold text-bc-blue">
          Conecte sua identidade Nostr para ver menções e notificações.
        </p>
      </div>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="bc-card rounded-2xl border border-bc-caramel/20 bg-bc-white p-8 text-center">
        <p className="text-2xl animate-bounce">🔔</p>
        <p className="mt-2 text-xs font-bold text-bc-blue">Buscando interações na rede Nostr...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bc-card rounded-2xl border border-bc-caramel/20 bg-bc-white p-8 text-center">
        <p className="text-2xl">🐾</p>
        <p className="mt-2 text-sm font-bold text-bc-blue">Nenhuma notificação recente.</p>
        <p className="text-xs text-bc-brown/70 mt-1">
          Quando alguém responder ou reagir a uma nota sua, ela aparecerá aqui!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif) => {
        const profile = profiles[notif.pubkey];
        const authorName = profile?.name || profile?.display_name || shortenNpub(notif.pubkey, 6);
        const isReaction = notif.kind === 7;
        const formattedDate = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(notif.created_at * 1000));

        return (
          <div
            key={notif.id}
            className="bc-card bc-card-interactive rounded-2xl border border-bc-caramel/20 bg-bc-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-bc-caramel/40 to-bc-green/30">
                {profile?.picture ? (
                  <Image
                    src={profile.picture}
                    alt={authorName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">
                    {isReaction ? "🐾" : "💬"}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/nostr/p/${notif.pubkey}`}
                    className="text-xs font-bold text-bc-blue hover:underline truncate"
                  >
                    {authorName}
                  </Link>
                  <span className="text-[10px] text-bc-brown/60 shrink-0">{formattedDate}</span>
                </div>

                <div className="text-xs text-bc-brown mt-1">
                  {isReaction ? (
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <span>🐾 Deu um biscoito na sua nota</span>
                    </span>
                  ) : (
                    <span>{notif.content}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
