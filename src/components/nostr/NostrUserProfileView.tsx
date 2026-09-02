"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { getNostrPool } from "@/lib/nostr/relays";
import { formatNostrPost, publishNostrFollowList } from "@/lib/nostr/events";
import { decodeNostrKey, pubkeyToNpub, shortenNpub } from "@/lib/nostr/keys";
import { NostrPostCard } from "./NostrPostCard";
import { NostrQrModal } from "./NostrQrModal";
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

  const npub = useMemo(() => {
    return pubkeyHex ? pubkeyToNpub(pubkeyHex) : rawPubkeyOrNpub;
  }, [pubkeyHex, rawPubkeyOrNpub]);

  const [profile, setProfile] = useState<NostrProfileMetadata | null>(null);
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showZapModal, setShowZapModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Follow state (NIP-02 Kind 3)
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const rawEventsRef = useRef<NostrEvent[]>([]);

  // Carregar lista de seguidos do usuário logado
  useEffect(() => {
    if (!identity?.pubkey) return;
    let active = true;
    const pool = getNostrPool();

    pool
      .get(relays, { kinds: [3], authors: [identity.pubkey] })
      .then((contactEvent) => {
        if (!active) return;
        if (contactEvent?.tags) {
          const pks = contactEvent.tags.filter((t) => t[0] === "p").map((t) => t[1]);
          setFollowingList(pks);
          setIsFollowing(pubkeyHex ? pks.includes(pubkeyHex) : false);
        }
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, [identity, pubkeyHex, relays]);

  async function handleToggleFollow() {
    if (!identity) {
      alert("Conecte sua identidade Nostr para seguir este caramelo!");
      return;
    }
    if (!pubkeyHex || followLoading) return;

    setFollowLoading(true);
    try {
      let updatedList: string[];
      if (isFollowing) {
        updatedList = followingList.filter((pk) => pk !== pubkeyHex);
      } else {
        updatedList = [...followingList, pubkeyHex];
      }

      await publishNostrFollowList({
        followingPubkeys: updatedList,
        identity,
        relays,
      });

      setFollowingList(updatedList);
      setIsFollowing(!isFollowing);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar lista de seguidos.");
    } finally {
      setFollowLoading(false);
    }
  }

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

    // 2. Buscar Notas do Autor (Kind 1)
    const sub = pool.subscribeMany(
      relays,
      {
        kinds: [1],
        authors: [pubkeyHex],
        limit: 30,
      },
      {
        onevent(event: NostrEvent) {
          if (!rawEventsRef.current.some((e) => e.id === event.id)) {
            rawEventsRef.current.push(event);
            rawEventsRef.current.sort((a, b) => b.created_at - a.created_at);

            const profilesMap = new Map<string, NostrProfileMetadata>();
            if (profile) {
              profilesMap.set(pubkeyHex, profile);
            }

            const formatted = rawEventsRef.current.map((e) =>
              formatNostrPost(e, profilesMap, new Map()),
            );
            setPosts(formatted);
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
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
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

      {/* Cartão de Perfil */}
      <div className="bc-card overflow-hidden rounded-3xl border border-bc-caramel/20 bg-bc-white/95 shadow-sm">
        {/* Banner */}
        <div className="h-32 w-full bg-gradient-to-r from-bc-gold/40 via-bc-caramel/30 to-bc-green/30 relative">
          {profile?.banner && (
            <Image
              src={profile.banner}
              alt="Banner do Perfil"
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>

        <div className="px-5 pb-5 pt-0">
          {/* Avatar e Ações */}
          <div className="flex flex-wrap items-end justify-between gap-3 -mt-10">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-bc-white bg-gradient-to-br from-bc-caramel/40 to-bc-green/30 shadow-md">
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

            <div className="flex flex-wrap items-center gap-2">
              {!isMe && (
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs ${
                    isFollowing
                      ? "border border-bc-caramel/30 bg-bc-cream/60 text-bc-brown hover:bg-red-500/10 hover:text-red-600 hover:border-red-400"
                      : "bg-bc-green text-white hover:bg-bc-green/90"
                  }`}
                >
                  {followLoading ? "..." : isFollowing ? "✓ Seguindo" : "🐾 Seguir"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="rounded-xl border border-bc-caramel/30 px-3 py-1.5 text-xs font-semibold text-bc-brown hover:bg-bc-cream transition-colors"
                title="Ver QR Code do perfil Nostr"
              >
                📱 QR Code
              </button>

              <button
                type="button"
                onClick={copyNpub}
                className="rounded-xl border border-bc-caramel/30 px-3 py-1.5 text-xs font-semibold text-bc-brown hover:bg-bc-cream transition-colors"
              >
                {copied ? "✓ Copiado" : "Copiar Npub"}
              </button>

              <button
                type="button"
                onClick={() => setShowZapModal(true)}
                className="flex items-center gap-1 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition-colors"
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
              <p className="mt-2 text-xs text-amber-800 font-medium flex items-center gap-1">
                <span>⚡</span>
                <span>Lightning Address: <code className="font-mono">{profile.lud16}</code></span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Notas do Autor */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-bc-blue flex items-center gap-1.5">
          <span>🐾</span>
          <span>Latidos de @{authorName}</span>
        </h2>

        {loading && posts.length === 0 ? (
          <div className="bc-card rounded-2xl border border-bc-caramel/20 bg-bc-white p-8 text-center shadow-xs">
            <p className="text-2xl animate-bounce">🐕</p>
            <p className="mt-2 text-xs font-bold text-bc-blue">Carregando notas do autor...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bc-card rounded-2xl border border-bc-caramel/20 bg-bc-white p-8 text-center shadow-xs">
            <p className="text-2xl">🐾</p>
            <p className="mt-2 text-sm font-bold text-bc-blue">Nenhuma nota publicada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
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
        targetPubkey={pubkeyHex ?? ""}
        targetProfile={profile ?? undefined}
      />

      {/* Modal de QR Code */}
      <NostrQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={`QR Code de @${authorName}`}
        description="Escaneie com qualquer cliente Nostr (Damus, Amethyst, Snort, Primal) ou carteira Lightning para seguir ou enviar zaps."
        data={npub}
      />
    </div>
  );
}
