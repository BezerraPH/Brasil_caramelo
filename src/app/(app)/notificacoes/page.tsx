"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import {
  NotificationRow,
  type NotificationRowData,
} from "@/components/NotificationRow";
import { useAsyncEffect } from "@/hooks/use-async-effect";

export default function NotificacoesPage() {
  const [items, setItems] = useState<NotificationRowData[]>([]);
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
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
  }

  return (
    <PageContainer narrow>
      <header className="bc-page-header bc-animate-in mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-bc-blue">Notificações</h1>
          <p className="text-sm text-bc-brown">
            {unread > 0
              ? `${unread} não lida${unread > 1 ? "s" : ""}`
              : "Tudo em dia na matilha"}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="bc-btn-ghost text-bc-green"
          >
            Marcar todas como lidas
          </button>
        )}
      </header>

      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="bc-card bc-skeleton h-16 rounded-2xl" />
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
        <ul className="bc-card space-y-1 p-2" role="list">
          {items.map((n, i) => (
            <li
              key={n.id}
              className={i < 5 ? `bc-animate-in bc-stagger-${i + 1}` : ""}
            >
              <NotificationRow item={n} onMarkRead={markOne} />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
