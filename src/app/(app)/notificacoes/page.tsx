"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import {
  NotificationRow,
  type NotificationRowData,
} from "@/components/NotificationRow";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type Filter = "all" | "unread" | "tribunal";

export default function NotificacoesPage() {
  const [items, setItems] = useState<NotificationRowData[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

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

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.read);
    if (filter === "tribunal") {
      return items.filter((n) => n.type === "TRIBUNAL_CASE");
    }
    return items;
  }, [filter, items]);

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

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "unread", label: "Não lidas" },
    { id: "tribunal", label: "Tribunal" },
  ];

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

      <div className="bc-animate-in bc-stagger-1 mb-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              filter === f.id
                ? "bg-bc-green text-white shadow-sm"
                : "bg-bc-white text-bc-brown border border-bc-blue/15"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="bc-card bc-skeleton h-16 rounded-2xl" />
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <div className="bc-card bc-animate-in p-10 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-3 font-medium text-bc-blue">
            {filter === "all" ? "Nada por aqui ainda" : "Nenhuma neste filtro"}
          </p>
          <p className="mt-1 text-sm text-bc-brown">
            {filter === "tribunal"
              ? "Julgamentos e pareceres do Tribunal aparecem aqui."
              : "Curtidas, comentários e amizades aparecem aqui."}
          </p>
          <Link href="/feed" className="bc-btn-primary mt-6 inline-block">
            Voltar ao feed
          </Link>
        </div>
      ) : (
        <ul className="bc-card space-y-1 p-2" role="list">
          {visible.map((n, i) => (
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
