"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { getNostrPool } from "@/lib/nostr/relays";
import { formatNostrPost } from "@/lib/nostr/events";
import { NostrPostCard } from "./NostrPostCard";
import { NostrCreatePost } from "./NostrCreatePost";
import { NostrAuthModal } from "./NostrAuthModal";
import { NostrProfileModal } from "./NostrProfileModal";
import { NostrRelayManager } from "./NostrRelayManager";
import { NostrRelayStatus } from "./NostrRelayStatus";
import type { Filter, NostrEvent, NostrPost, NostrProfileMetadata } from "@/lib/nostr/types";

const TOPIC_TAGS = [
  { id: "brasilcaramelo", label: "🐕 #brasilcaramelo" },
  { id: "viralata", label: "🐾 #viralata" },
  { id: "matilha", label: "🐺 #matilha" },
  { id: "pet", label: "🦴 #pet" },
  { id: "bitcoin", label: "⚡ #bitcoin" },
  { id: "", label: "🌐 Todas as Notas" },
];

export function NostrFeedView() {
  const { identity, relays } = useNostrAuth();
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRelayManagerOpen, setIsRelayManagerOpen] = useState(false);

  // Search & Filter state
  const [filterTag, setFilterTag] = useState<string>("brasilcaramelo");
  const [searchQuery, setSearchQuery] = useState("");

  const profilesMapRef = useRef<Map<string, NostrProfileMetadata>>(new Map());
  const reactionsMapRef = useRef<Map<string, number>>(new Map());
  const rawEventsRef = useRef<NostrEvent[]>([]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshFeed = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((v) => v + 1);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pool = getNostrPool();
    const filter: Filter = filterTag
      ? { kinds: [1], "#t": [filterTag], limit: 40 }
      : { kinds: [1], limit: 40 };

    rawEventsRef.current = [];
    reactionsMapRef.current = new Map();

    const sub = pool.subscribeMany(relays, filter, {
      onevent(event: NostrEvent) {
        if (!rawEventsRef.current.some((e) => e.id === event.id)) {
          rawEventsRef.current.push(event);
          rawEventsRef.current.sort((a, b) => b.created_at - a.created_at);

          const formatted = rawEventsRef.current.map((e) =>
            formatNostrPost(e, profilesMapRef.current, reactionsMapRef.current),
          );
          setPosts(formatted);

          // Buscar perfil do autor se ainda não estiver em cache
          if (!profilesMapRef.current.has(event.pubkey)) {
            pool
              .get(relays, { kinds: [0], authors: [event.pubkey] })
              .then((profEvent) => {
                if (profEvent?.content) {
                  try {
                    const parsed = JSON.parse(profEvent.content);
                    profilesMapRef.current.set(event.pubkey, parsed);
                    setPosts((current) =>
                      current.map((p) =>
                        p.pubkey === event.pubkey ? { ...p, profile: parsed } : p,
                      ),
                    );
                  } catch {
                    // ignore
                  }
                }
              })
              .catch(() => null);
          }
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
  }, [relays, filterTag, refreshTrigger]);

  // Filtragem no cliente por texto de busca
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.npub.toLowerCase().includes(q) ||
        p.profile?.name?.toLowerCase().includes(q) ||
        p.profile?.display_name?.toLowerCase().includes(q),
    );
  }, [posts, searchQuery]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Header Descentralizado */}
      <div className="bc-card bc-glass flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-bc-caramel/30 bg-bc-white p-5 shadow-lg">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-bc-blue">
            <span>⚡</span>
            <span>Feed Nostr Descentralizado</span>
          </h1>
          <p className="mt-0.5 text-xs text-bc-brown/80">
            Rede imutável, aberta e resistente à censura via WebSockets P2P.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div onClick={() => setIsRelayManagerOpen(true)} className="cursor-pointer">
            <NostrRelayStatus />
          </div>

          {identity ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="rounded-xl border border-bc-caramel/30 bg-bc-cream/60 px-3 py-1.5 text-xs font-bold text-bc-brown hover:bg-bc-cream transition-colors"
            >
              🐾 Perfil
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bc-btn-primary rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              Entrar no Nostr ⚡
            </button>
          )}

          <button
            onClick={() => setIsRelayManagerOpen(true)}
            className="rounded-xl border border-bc-caramel/30 p-1.5 text-xs text-bc-brown/70 hover:bg-black/5"
            title="Configurar Relays"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Caixa de Criação de Post Nostr */}
      <NostrCreatePost
        onPostPublished={refreshFeed}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Barra de Busca e Tópicos */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar notas, palavras-chave ou @npub..."
            className="w-full rounded-2xl border border-bc-caramel/30 bg-bc-white px-4 py-2.5 text-xs text-bc-brown shadow-xs focus:border-bc-blue focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-bc-brown/50 hover:text-bc-brown"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros de Tags */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(tag.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  filterTag === tag.id
                    ? "bg-bc-blue text-white shadow-sm scale-105"
                    : "border border-bc-caramel/25 bg-bc-white/80 text-bc-brown hover:bg-bc-white"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <button
            onClick={refreshFeed}
            disabled={loading}
            className="shrink-0 text-xs font-bold text-bc-green hover:underline"
          >
            {loading ? "Sincronizando…" : "↻ Atualizar"}
          </button>
        </div>
      </div>

      {/* Lista de Posts */}
      {loading && filteredPosts.length === 0 ? (
        <div className="bc-card bc-glass rounded-3xl border border-bc-caramel/20 bg-bc-white p-8 text-center shadow-md">
          <p className="text-3xl animate-bounce">🐕</p>
          <p className="mt-2 text-sm font-bold text-bc-blue">Sintonizando com os relays Nostr…</p>
          <p className="text-xs text-bc-brown/70">Assinaturas criptográficas Schnorr ativas</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bc-card bc-glass rounded-3xl border border-bc-caramel/20 bg-bc-white p-8 text-center shadow-md">
          <p className="text-3xl">🐾</p>
          <p className="mt-2 text-sm font-bold text-bc-blue">Nenhum latido encontrado.</p>
          <p className="text-xs text-bc-brown/70">
            {searchQuery
              ? "Tente buscar por outro termo ou hashtag."
              : "Seja o primeiro a publicar usando o formulário acima!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <NostrPostCard
              key={post.id}
              post={post}
              onReaction={refreshFeed}
              onReplyPublished={refreshFeed}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <NostrAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <NostrProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={refreshFeed}
      />
      <NostrRelayManager
        isOpen={isRelayManagerOpen}
        onClose={() => setIsRelayManagerOpen(false)}
      />
    </div>
  );
}
