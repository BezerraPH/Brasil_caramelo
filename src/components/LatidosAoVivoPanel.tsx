"use client";

import Link from "next/link";
import { CASINHAS } from "@/lib/casinhas";

export function LatidosAoVivoPanel() {
  const livekitConfigured = Boolean(process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim());

  return (
    <div className="space-y-6">
      <section className="bc-card bc-latidos-header bc-animate-in p-6 text-center">
        <h2 className="bc-shimmer-text text-2xl font-bold text-bc-blue">
          🎙️ Latidos ao Vivo
        </h2>
        <p className="mt-2 text-sm text-bc-brown">
          Salas de áudio por casinha — estilo rádio da matilha (Clubhouse/Twitter
          Spaces).
        </p>
        {!livekitConfigured && (
          <p className="mt-3 rounded-lg bg-bc-caramel/10 px-3 py-2 text-xs text-bc-brown">
            Configure <code className="text-[10px]">NEXT_PUBLIC_LIVEKIT_URL</code>{" "}
            no servidor para ativar salas ao vivo. Veja LIVEKIT.md. WebRTC 1:1 já
            funciona em{" "}
            <Link href="/mensagens" className="text-bc-blue underline">
              Mensagens
            </Link>
            .
          </p>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {CASINHAS.map((c, i) => (
          <article
            key={c.slug}
            className="bc-latidos-room bc-card bc-animate-in-up p-4"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <p className="text-2xl">{c.emoji}</p>
            <h3 className="font-bold text-bc-blue">{c.name}</h3>
            <p className="mt-1 text-xs text-bc-brown">{c.tagline}</p>
            <p className="mt-2 text-[10px] text-bc-brown/70">
              {livekitConfigured ? "Sala ao vivo disponível" : "Aguardando LiveKit"}
            </p>
            {livekitConfigured ? (
              <Link
                href={`/latidos/${c.slug}`}
                className="bc-btn-primary bc-latidos-join-btn mt-3 inline-block text-xs"
              >
                🎙️ Entrar na sala
              </Link>
            ) : (
              <Link
                href={`/casinha/${c.slug}`}
                className="mt-3 inline-block text-xs font-medium text-bc-green hover:underline"
              >
                Ver casinha →
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
