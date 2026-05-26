"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { UserAvatar } from "@/components/UserAvatar";

type Visitor = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  visitedAt: string;
};

export function ProfileVisitorsPanel() {
  const [enabled, setEnabled] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/profile-visits");
    const data = await res.json();
    if (res.ok) {
      setEnabled(data.enabled ?? true);
      setVisitors(data.visitors ?? []);
      setHint(data.message ?? null);
    }
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  if (loading) {
    return (
      <p className="text-xs text-bc-brown animate-pulse">Carregando visitas…</p>
    );
  }

  if (!enabled) {
    return (
      <section className="mt-6 rounded-xl border border-bc-blue/15 bg-bc-white/60 p-4">
        <h2 className="font-bold text-bc-blue text-sm">Quem visitou?</h2>
        <p className="mt-2 text-xs text-bc-brown">{hint}</p>
        <Link href="/configuracoes" className="mt-2 inline-block text-xs text-bc-blue hover:underline">
          Ativar visitas recíprocas →
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-bc-blue/15 bg-bc-white/60 p-4">
      <h2 className="font-bold text-bc-blue text-sm">Quem visitou seu perfil</h2>
      <p className="mt-1 text-[11px] text-bc-brown/80">
        Só aparecem amigos da matilha que também permitem visitas recíprocas.
      </p>
      {visitors.length === 0 ? (
        <p className="mt-3 text-xs text-bc-brown">Ninguém passou por aqui ainda.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visitors.map((v) => (
            <li key={v.id} className="flex items-center gap-2">
              <UserAvatar name={v.name} avatarUrl={v.avatarUrl} size="sm" />
              <Link
                href={`/perfil/${v.username}`}
                className="text-sm text-bc-blue hover:underline"
              >
                {v.name}
              </Link>
              <span className="ml-auto text-[10px] text-bc-brown/70">
                {new Date(v.visitedAt).toLocaleDateString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
