"use client";

import Link from "next/link";
import { useCallback } from "react";
import { PageContainer } from "@/components/PageContainer";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { useState } from "react";

type NotificationItem = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificacoesPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/notifications");
    const data = await res.json();
    if (res.ok) {
      setItems(data.notifications);
      setUnread(data.unreadCount);
    }
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  async function markOne(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <PageContainer narrow>
      <header className="bc-animate-in mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-bc-blue">Notificações</h1>
          <p className="text-sm text-bc-brown">
            {unread > 0
              ? `${unread} não lida${unread > 1 ? "s" : ""}`
              : "Tudo em dia na matilha"}
          </p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={markAllRead} className="bc-btn-ghost text-bc-green">
            Marcar todas como lidas
          </button>
        )}
      </header>

      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="bc-card bc-skeleton-pulse h-16 p-4" />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="bc-card bc-animate-in p-10 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-3 font-medium text-bc-blue">Nada por aqui ainda</p>
          <p className="mt-1 text-sm text-bc-brown">
            Curtidas, comentários e amizades aparecem aqui.
          </p>
          <Link href="/feed" className="bc-btn-primary mt-6 inline-block">
            Voltar ao feed
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n, i) => (
            <li
              key={n.id}
              className={`bc-card bc-animate-in p-4 transition ${i < 5 ? `bc-stagger-${i + 1}` : ""} ${
                n.read ? "" : "border-bc-green/30 bg-bc-green/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => !n.read && void markOne(n.id)}
                      className={`text-sm hover:underline ${
                        n.read ? "text-bc-brown" : "font-medium text-bc-blue"
                      }`}
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <p
                      className={`text-sm ${n.read ? "text-bc-brown" : "font-medium text-bc-blue"}`}
                    >
                      {n.message}
                    </p>
                  )}
                  <time className="mt-1 block text-xs text-bc-brown/80">
                    {new Date(n.createdAt).toLocaleString("pt-BR")}
                  </time>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => void markOne(n.id)}
                    className="shrink-0 text-xs text-bc-green hover:underline"
                  >
                    Lida
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
