"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type PackEventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: string;
  rsvpCount: number;
  myRsvp: { ticketToken: string } | null;
  latidosHref?: string;
};

type MatilhaEventsPanelProps = {
  slug: string;
  joined: boolean;
};

type Ticket = {
  token: string;
  event: { title: string; location: string; startsAt: string; packName: string };
  pet: { name: string; color: string; level: number };
  holder: string;
};

export function MatilhaEventsPanel({ slug, joined }: MatilhaEventsPanelProps) {
  const [events, setEvents] = useState<PackEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Recife, PE");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/packs/${slug}/events`);
    const data = await res.json();
    if (res.ok) setEvents(data.events ?? []);
    setLoading(false);
  }, [slug]);

  useAsyncEffect(load, [load]);

  async function createEvent() {
    if (!title.trim() || !startsAt) return;
    setBusy("create");
    const res = await fetch(`/api/packs/${slug}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location, description, startsAt }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setShowForm(false);
      await load();
    }
    setBusy(null);
  }

  async function rsvp(eventId: string) {
    setBusy(eventId);
    const res = await fetch(`/api/packs/events/${eventId}/rsvp`, { method: "POST" });
    if (res.ok) {
      const ticketRes = await fetch(`/api/packs/events/${eventId}/rsvp`);
      const ticketData = await ticketRes.json();
      if (ticketRes.ok) setTicket(ticketData.ticket);
      await load();
    }
    setBusy(null);
  }

  if (loading) {
    return <p className="text-sm text-bc-brown animate-pulse">Carregando encontros…</p>;
  }

  return (
    <div className="space-y-4">
      {joined && (
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="bc-btn-secondary text-sm"
        >
          {showForm ? "Cancelar" : "+ Criar encontro local"}
        </button>
      )}

      {showForm && (
        <div className="space-y-2 rounded-xl border border-bc-green/30 p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Churrasco da Matilha em Recife"
            className="bc-input text-sm"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Local"
            className="bc-input text-sm"
          />
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="bc-input text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Detalhes (opcional)"
            className="bc-input resize-none text-sm"
          />
          <button
            type="button"
            disabled={busy === "create"}
            onClick={createEvent}
            className="bc-btn-primary text-sm"
          >
            Publicar encontro
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-bc-brown">Nenhum encontro agendado.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="rounded-xl border border-bc-blue/15 p-4">
              <p className="font-semibold text-bc-blue">{e.title}</p>
              <p className="text-xs text-bc-brown">📍 {e.location}</p>
              <p className="text-xs text-bc-brown">
                🗓{" "}
                {new Date(e.startsAt).toLocaleString("pt-BR")}
              </p>
              {e.description && (
                <p className="mt-1 text-sm text-bc-brown">{e.description}</p>
              )}
              <p className="mt-1 text-xs text-bc-green">
                {e.rsvpCount} confirmado{e.rsvpCount !== 1 ? "s" : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {e.latidosHref && (
                  <Link
                    href={e.latidosHref}
                    className="bc-btn-secondary inline-flex items-center gap-1 text-xs"
                  >
                    🎙 Entrar na sala ao vivo
                  </Link>
                )}
                {joined && (
                  <button
                    type="button"
                    disabled={busy === e.id}
                    onClick={() => rsvp(e.id)}
                    className="bc-btn-primary text-xs"
                  >
                    {e.myRsvp ? "Ver ingresso 🎫" : "Confirmar presença"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {ticket && (
        <div
          className="rounded-2xl border-2 border-dashed border-bc-caramel p-5 text-center"
          style={{ background: `linear-gradient(135deg, ${ticket.pet.color}22, #fff8f0)` }}
        >
          <p className="text-xs font-bold uppercase text-bc-caramel">Ingresso da Matilha</p>
          <div className="mx-auto my-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
            style={{ border: `3px solid ${ticket.pet.color}` }}>
            🐕
          </div>
          <p className="font-bold text-bc-blue">{ticket.pet.name}</p>
          <p className="text-sm text-bc-brown">{ticket.holder}</p>
          <p className="mt-2 text-sm font-semibold">{ticket.event.title}</p>
          <p className="text-xs text-bc-brown">{ticket.event.location}</p>
          <p className="mt-2 font-mono text-[10px] text-bc-brown/70">{ticket.token}</p>
          <button
            type="button"
            onClick={() => setTicket(null)}
            className="bc-btn-ghost mt-3 text-xs"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
