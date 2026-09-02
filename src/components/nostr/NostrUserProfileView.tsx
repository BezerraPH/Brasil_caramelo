"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { getNostrPool } from "@/lib/nostr/relays";
import { formatNostrPost } from "@/lib/nostr/events";
import { decodeNostrKey, shortenNpub } from "@/lib/nostr/keys";
import { NostrPostCard } from "./NostrPostCard";
import { NostrZapModal } from "./NostrZapModal";
import type { NostrEvent, NostrPost, NostrProfileMetadata } from "@/lib/nostr/types";

type Props = {
  rawPubkeyOrNpub: string;
};

export function NostrUserProfileView({ rawPubkeyOrNpub }: Props) {
  const { relays, identity } = useNostrAuth();

  const pubkeyHex = useMemo(() => {
    try {
      const decoded = decodeNostrKey(rawPubkeyOrNpub);
      if (decoded.hexPubkey) {
        return decoded.hexPubkey;
      }
      return rawPubkeyOrNpub;
    } catch {
      return rawPubkeyOrNpub;
    }
  }, [rawPubkeyOrNpub]);

  const [profile, setProfile] = useState<NostrProfileMetadata | null>(null);
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showZapModal, setShowZapModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const rawEventsRef = useRef<NostrEvent[]>([]);

  // Buscar perfil (Kind 0) e posts do autor (Kind 1)
  useEffect(() => {
    if (!pubkeyHex || typeof window === "undefined") return;

    const pool = getNostrPool();
    rawEventsRef.current = [];

    // 1. Buscar Metadados de Perfil
    pool
      .get(relays, { kinds: [0], authors: [pubkeyHex] })
      .then((profEvent) => {
        if (profEvent?.content) {
          try {
            const parsed = JSON.parse(profEvent.content) as NostrProfileMetadata;
            setProfile(parsed);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => null);

    // 2. Buscar Notas do Autor
    const sub = pool.subscribeMany(relays, { kinds: [1], authors: [pubkeyHex], limit: 30 }, {
      onevent(event: NostrEvent) {
        if (!rawEventsRef.current.some((e) => e.id === event.id)) {
          rawEventsRef.current.push(event);
          rawEventsRef.current.sort((a, b) => b.created_at - a.created_at);

          const formatted = rawEventsRef.current.map((e) =>
            formatNostrPost(
              e,
              new Map([[pubkeyHex, profile || {}]]),
              new Map(),
            ),
          );
          setPosts(formatted);
        }
      },
      oneose() {
        setLoading(false);
      },
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
      sub.close();
    };
  }, [pubkeyHex, relays, profile]);

  const authorName = profile?.name || profile?.display_name || (pubkeyHex ? shortenNpub(pubkeyHex, 8) : "Caramelo");
  const dogBreed = profile?.dog_breed || "Caramelo Nostr";
  const isMe = identity?.pubkey === pubkeyHex;

  async function copyNpub() {
    if (!pubkeyHex) return;
    try {
      await navigator.clipboard.writeText(rawPubkeyOrNpub);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <Link
          href="/nostr"
          className="flex items-center gap-1.5 text-xs font-bold text-bc-blue hover:underline"
        >
          <span>←</span>
          <span>Voltar ao Feed Nostr</span>
        </Link>
      </div>

      {/* Card do Perfil */}
      <div className="bc-card relative overflow-hidden rounded-3xl border border-bc-caramel/30 bg-bc-white shadow-xl">
        {/* Banner */}
        <div className="relative h-36 w-full bg-gradient-to-r from-bc-caramel/40 via-amber-200 to-bc-blue/30">
          {profile?.banner && (
            <Image
              src={profile.banner}
              alt="Banner"
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>

        {/* Informações do Perfil */}
        <div className="relative px-6 pb-6 pt-2">
          {/* Avatar sobreposto */}
          <div className="relative -mt-16 flex items-end justify-between">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-bc-white bg-gradient-to-br from-bc-caramel/40 to-bc-green/30 shadow-lg">
              {profile?.picture ? (
                <Image
                  src={profile.picture}
                  alt={authorName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">🐕</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyNpub}
                className="rounded-xl border border-bc-caramel/30 px-3 py-1.5 text-xs font-semibold text-bc-brown hover:bg-bc-cream transition-colors"
              >
                {copied ? "✓ Npub Copiado" : "Copiar Chave"}
              </button>

              <button
                type="button"
                onClick={() => setShowZapModal(true)}
                className="flex items-center gap-1 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition-colors"
              >
                <span>⚡</span>
                <span>Zap</span>
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-bc-blue">{authorName}</h1>
              <span className="bc-badge bg-bc-caramel/15 text-xs text-bc-brown">
                {dogBreed}
              </span>
              {isMe && (
                <span className="rounded-md bg-bc-green/15 px-2 py-0.5 text-[10px] font-bold text-bc-green">
                  Você
                </span>
              )}
            </div>

            <p className="font-mono text-xs text-bc-brown/70 mt-0.5 break-all">
              {rawPubkeyOrNpub}
            </p>

            {profile?.nip05 && (
              <p className="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span>🛡️</span>
                <span>{profile.nip05}</span>
              </p>
            )}

            {profile?.about && (
              <p className="mt-3 text-sm text-bc-brown whitespace-pre-line leading-relaxed">
                {profile.about}
              </p>
            )}

            {profile?.lud16 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <span>⚡ Lightning:</span>
                <span className="font-mono">{profile.lud16}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Notas do Autor */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-bc-blue flex items-center gap-2">
          <span>🐾</span>
          <span>Latidos e Notas Publicadas ({posts.length})</span>
        </h2>

        {loading && posts.length === 0 ? (
          <div className="bc-card rounded-2xl border border-bc-caramel/20 bg-bc-white p-6 text-center">
            <p className="text-2xl animate-bounce">🐕</p>
            <p className="mt-2 text-xs font-bold text-bc-blue">Carregando notas do autor...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bc-card rounded-2xl border border-bc-caramel/20 bg-bc-white p-6 text-center text-xs text-bc-brown/70">
            Nenhuma nota encontrada para este autor nos relays conectados.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <NostrPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Zap */}
      <NostrZapModal
        isOpen={showZapModal}
        onClose={() => setShowZapModal(false)}
        targetPubkey={pubkeyHex}
        targetProfile={profile ?? undefined}
      />
    </div>
  );
}
