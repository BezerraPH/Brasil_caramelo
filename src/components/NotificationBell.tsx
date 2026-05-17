"use client";

import Link from "next/link";
import Pusher from "pusher-js";
import { useCallback, useEffect, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type NotificationItem = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

type NotificationBellProps = {
  userId: string;
  pusherKey?: string | null;
  pusherCluster?: string | null;
};

export function NotificationBell({
  userId,
  pusherKey,
  pusherCluster,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    if (res.ok) {
      setItems(data.notifications);
      setUnread(data.unreadCount);
    }
  }, []);

  useAsyncEffect(load, [load]);

  useEffect(() => {
    if (!pusherKey || !pusherCluster) {
      const t = setInterval(load, 45000);
      return () => clearInterval(t);
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-user-${userId}`);
    channel.bind("notification", () => {
      load();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-user-${userId}`);
      pusher.disconnect();
    };
  }, [pusherKey, pusherCluster, userId, load]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-bc-blue transition hover:bg-bc-blue/10"
        aria-label="Notificações"
      >
        🔔
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bc-caramel px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div className="bc-menu-enter absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-bc-blue/15 bg-bc-white shadow-xl">
            <div className="flex items-center justify-between border-b border-bc-blue/10 px-4 py-3">
              <span className="font-semibold text-bc-blue">
                Notificações
                {pusherKey && (
                  <span className="ml-1 text-[10px] font-normal text-bc-green">
                    ● ao vivo
                  </span>
                )}
              </span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-bc-green hover:underline"
                >
                  Marcar lidas
                </button>
              )}
            </div>
            <div className="border-b border-bc-blue/10 px-4 py-2 text-center">
              <Link
                href="/notificacoes"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-bc-blue hover:underline"
              >
                Ver todas →
              </Link>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {items.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-bc-brown">
                  Nada por aqui ainda 🐕
                </li>
              ) : (
                items.map((n) => (
                  <li key={n.id}>
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => setOpen(false)}
                        className={`block rounded-xl px-3 py-2.5 text-sm transition hover:bg-bc-green/10 ${
                          n.read
                            ? "text-bc-brown"
                            : "bg-bc-blue/5 font-medium text-bc-blue"
                        }`}
                      >
                        {n.message}
                      </Link>
                    ) : (
                      <p
                        className={`rounded-xl px-3 py-2.5 text-sm ${
                          n.read
                            ? "text-bc-brown"
                            : "bg-bc-blue/5 font-medium text-bc-blue"
                        }`}
                      >
                        {n.message}
                      </p>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
