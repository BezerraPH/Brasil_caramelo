"use client";

import Link from "next/link";
import { CASINHAS } from "@/lib/casinhas";

export function LatidosAoVivoPanel() {
  const livekitConfigured = Boolean(process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim());

  return (
    <div className="space-y-6">
      <section className="bc-card bc-latidos-header bc-animate-in p-6 text-center shadow-sm">
        <h2 className="bc-shimmer-text text-2xl font-black text-bc-blue sm:text-3xl">
          🎙️ Latidos ao Vivo
        </h2>
        <p className="mt-2 text-sm font-semibold text-bc-brown">
          Salas de bate-papo em áudio da matilha em tempo real
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {CASINHAS.map((c, i) => (
          <article
            key={c.slug}
            className="bc-card bc-card-interactive bc-animate-in-up flex flex-col justify-between p-5 border border-bc-caramel/25 shadow-xs"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bc-sand/40 text-2xl shadow-xs">
                  {c.emoji}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sala Aberta
                </span>
              </div>

              <h3 className="mt-3 text-base font-black text-bc-blue">{c.name}</h3>
              <p className="mt-1 text-xs font-semibold text-bc-brown">{c.tagline}</p>
            </div>

            <div className="mt-4 border-t border-bc-caramel/15 pt-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-bc-brown/70">
                🎧 Áudio P2P WebRTC
              </span>
              <Link
                href={livekitConfigured ? `/latidos/${c.slug}` : `/casinha/${c.slug}`}
                className="rounded-xl bg-gradient-to-r from-bc-green to-bc-caramel px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition"
              >
                🎙️ Entrar na Sala
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
