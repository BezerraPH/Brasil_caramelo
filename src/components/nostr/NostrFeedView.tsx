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
import { NostrNotifications } from "./NostrNotifications";
import { NostrBookmarks } from "./NostrBookmarks";
import { NostrDirectMessages } from "./NostrDirectMessages";
import { NostrArticlesView } from "./NostrArticlesView";
import type { Filter, NostrEvent, NostrPost, NostrProfileMetadata } from "@/lib/nostr/types";

type TabType = "feed" | "following" | "articles" | "notifications" | "dms" | "bookmarks";

const TOPIC_TAGS = [
  { id: "brasilcaramelo", label: "🐕 #brasilcaramelo" },
  { id: "viralata", label: "🐾 #viralata" },
  { id: "bitcoin", label: "⚡ #bitcoin" },
  { id: "pet", label: "🦴 #pet" },
  { id: "", label: "🌐 Todas as Notas" },
];

export function NostrFeedView() {
  const { identity, relays } = useNostrAuth();
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRelayManagerOpen, setIsRelayManagerOpen] = useState(false);

  // Search & Filter state
  const [filterTag, setFilterTag] = useState<string>("brasilcaramelo");
  const [searchQuery, setSearchQuery] = useState("");
  const [followingPubkeys, setFollowingPubkeys] = useState<string[]>([]);

  const profilesMapRef = useRef<Map<string, NostrProfileMetadata>>(new Map());
  const reactionsMapRef = useRef<Map<string, number>>(new Map());
  const rawEventsRef = useRef<NostrEvent[]>([]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshFeed = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((v) => v + 1);
  }, []);

  // Buscar lista de seguidos (Kind 3)
  useEffect(() => {
    if (!identity?.pubkey) return;
    const pool = getNostrPool();
    pool
      .get(relays, { kinds: [3], authors: [identity.pubkey] })
      .then((ev) => {
        if (ev?.tags) {
          const pks = ev.tags.filter((t) => t[0] === "p").map((t) => t[1]);
          setFollowingPubkeys(pks);
        }
      })
      .catch(() => null);
  }, [identity?.pubkey, relays, refreshTrigger]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pool = getNostrPool();
    let filter: Filter;

    if (activeTab === "following") {
      if (followingPubkeys.length === 0) {
        const resetTimer = setTimeout(() => {
          setPosts([]);
          setLoading(false);
        }, 0);
        return () => clearTimeout(resetTimer);
      }
      filter = { kinds: [1], authors: followingPubkeys, limit: 40 };
    } else {
      filter = filterTag
        ? { kinds: [1], "#t": [filterTag], limit: 40 }
        : { kinds: [1], limit: 40 };
    }

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
  }, [relays, filterTag, refreshTrigger, activeTab, followingPubkeys]);

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
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-4 sm:py-6">
      {/* Header Unificado e Limpo */}
      <div className="bc-card flex flex-wrap items-center justify-between gap-3 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-xl text-white shadow-sm">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-black text-bc-blue">Modo Livre Descentralizado</h1>
            <p className="text-xs font-semibold text-bc-brown">
              Publicações livres e imutáveis da matilha no protocolo Nostr
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {identity ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-1.5 text-xs font-bold text-bc-brown hover:bg-bc-sand/30 shadow-xs transition-colors"
            >
              🐾 Meu Perfil
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-bc-green to-bc-caramel px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-95 transition"
            >
              Entrar Fácil com Chave ⚡
            </button>
          )}

          <button
            onClick={() => setIsRelayManagerOpen(true)}
            className="rounded-xl border border-bc-caramel/25 bg-bc-white p-2 text-xs text-bc-brown hover:bg-black/5 hover:text-bc-blue transition-colors"
            title="Gerenciar Servidores de Rede"
          >
            🌐 Servidores
          </button>
        </div>
      </div>

      {/* Navegação por Abas Segmentadas */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-black/5 p-1 text-xs">
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex flex-1 min-w-[70px] items-center justify-center gap-1 rounded-xl py-2 font-bold transition-all ${
            activeTab === "feed"
              ? "bg-bc-white text-bc-blue shadow-xs"
              : "text-bc-brown/70 hover:text-bc-blue"
          }`}
        >
          <span>🔥</span>
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab("following")}
          className={`flex flex-1 min-w-[85px] items-center justify-center gap-1 rounded-xl py-2 font-bold transition-all ${
            activeTab === "following"
              ? "bg-bc-white text-bc-blue shadow-xs"
              : "text-bc-brown/70 hover:text-bc-blue"
          }`}
        >
          <span>🐾</span>
          <span>Seguindo</span>
        </button>

        <button
          onClick={() => setActiveTab("articles")}
          className={`flex flex-1 min-w-[75px] items-center justify-center gap-1 rounded-xl py-2 font-bold transition-all ${
            activeTab === "articles"
              ? "bg-bc-white text-bc-blue shadow-xs"
              : "text-bc-brown/70 hover:text-bc-blue"
          }`}
        >
          <span>📖</span>
          <span>Artigos</span>
        </button>

        <button
          onClick={() => setActiveTab("dms")}
          className={`flex flex-1 min-w-[75px] items-center justify-center gap-1 rounded-xl py-2 font-bold transition-all ${
            activeTab === "dms"
              ? "bg-bc-white text-bc-blue shadow-xs"
              : "text-bc-brown/70 hover:text-bc-blue"
          }`}
        >
          <span>🔒</span>
          <span>Chat DM</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex flex-1 min-w-[80px] items-center justify-center gap-1 rounded-xl py-2 font-bold transition-all ${
            activeTab === "notifications"
              ? "bg-bc-white text-bc-blue shadow-xs"
              : "text-bc-brown/70 hover:text-bc-blue"
          }`}
        >
          <span>🔔</span>
          <span>Alertas</span>
        </button>

        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex flex-1 min-w-[75px] items-center justify-center gap-1 rounded-xl py-2 font-bold transition-all ${
            activeTab === "bookmarks"
              ? "bg-bc-white text-bc-blue shadow-xs"
              : "text-bc-brown/70 hover:text-bc-blue"
          }`}
        >
          <span>🔖</span>
          <span>Salvos</span>
        </button>
      </div>

      {activeTab === "articles" && <NostrArticlesView />}

      {activeTab === "dms" && <NostrDirectMessages />}

      {activeTab === "notifications" && <NostrNotifications />}

      {activeTab === "bookmarks" && <NostrBookmarks />}

      {(activeTab === "feed" || activeTab === "following") && (
        <div className="space-y-5">
          {/* Caixa de Criação de Post */}
          <NostrCreatePost
            onPostPublished={refreshFeed}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          {/* Barra de Busca e Tópicos */}
          <div className="space-y-2.5">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar notas, assuntos ou @npub..."
                className="w-full rounded-2xl border border-bc-caramel/25 bg-bc-white/95 px-4 py-2 text-xs text-bc-brown shadow-xs focus:border-bc-blue focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-xs text-bc-brown/50 hover:text-bc-brown"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtros de Tags (somente no feed global) */}
            {activeTab === "feed" && (
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {TOPIC_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setFilterTag(tag.id)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                        filterTag === tag.id
                          ? "bg-bc-blue text-white shadow-xs scale-105"
                          : "border border-bc-caramel/20 bg-bc-white/80 text-bc-brown hover:bg-bc-white hover:border-bc-caramel/40"
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
            )}
          </div>

          {/* Lista de Posts */}
          {loading && filteredPosts.length === 0 ? (
            <div className="bc-card rounded-3xl p-8 text-center shadow-xs">
              <p className="text-3xl animate-bounce">🐕</p>
              <p className="mt-2 text-sm font-bold text-bc-blue">Sintonizando com os relays Nostr…</p>
              <p className="text-xs text-bc-brown/70 mt-0.5">Assinaturas Schnorr ativas</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bc-card rounded-3xl p-8 text-center shadow-xs">
              <p className="text-3xl">🐾</p>
              <p className="mt-2 text-sm font-bold text-bc-blue">
                {activeTab === "following"
                  ? "Você ainda não segue ninguém ou seus amigos ainda não latiram."
                  : "Nenhum latido encontrado."}
              </p>
              <p className="text-xs text-bc-brown/70 mt-0.5">
                {activeTab === "following"
                  ? "Visite o perfil de outros caramelos e clique em '🐾 Seguir' para acompanhar a matilha!"
                  : searchQuery
                    ? "Tente buscar por outro termo ou hashtag."
                    : "Seja o primeiro a publicar usando o formulário acima!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
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
