"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { getNostrPool } from "@/lib/nostr/relays";
import { formatNostrPost } from "@/lib/nostr/events";
import { NostrPostCard } from "./NostrPostCard";
import { NostrCreatePost } from "./NostrCreatePost";
import { NostrAuthModal } from "./NostrAuthModal";
import { NostrRelayStatus } from "./NostrRelayStatus";
import type { Filter, NostrEvent, NostrPost, NostrProfileMetadata } from "@/lib/nostr/types";

export function NostrFeedView() {
  const { relays } = useNostrAuth();
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string>("brasilcaramelo");

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

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Header Descentralizado */}
      <div className="bc-card bc-glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bc-caramel/30 bg-bc-white p-4 shadow-md">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-bc-blue">
            <span>⚡</span>
            <span>Feed Nostr Descentralizado</span>
          </h1>
          <p className="text-xs text-bc-brown">
            Posts imutáveis transmitidos diretamente via Relays WebSocket.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NostrRelayStatus />
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bc-btn-primary px-3 py-1.5 text-xs font-bold"
          >
            Identidade 🐾
          </button>
        </div>
      </div>

      {/* Caixa de Criação de Post Nostr */}
      <NostrCreatePost
        onPostPublished={refreshFeed}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Filtros de Tags */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "brasilcaramelo", label: "#brasilcaramelo" },
            { id: "viralata", label: "#viralata" },
            { id: "matilha", label: "#matilha" },
            { id: "", label: "Todas as Notas" },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setFilterTag(tag.id)}
              className={`rounded-full px-3 py-1 font-bold transition-all ${
                filterTag === tag.id
                  ? "bg-bc-blue text-white shadow-sm"
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
          className="text-xs font-bold text-bc-green hover:underline"
        >
          {loading ? "Sincronizando…" : "↻ Atualizar"}
        </button>
      </div>

      {/* Lista de Posts */}
      {loading && posts.length === 0 ? (
        <div className="bc-card bc-glass rounded-2xl border border-bc-caramel/20 bg-bc-white p-8 text-center">
          <p className="text-2xl animate-bounce">🐕</p>
          <p className="mt-2 text-sm font-bold text-bc-blue">Sintonizando com a rede Nostr…</p>
          <p className="text-xs text-bc-brown/70">Consultando relays WebSocket globais</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bc-card bc-glass rounded-2xl border border-bc-caramel/20 bg-bc-white p-8 text-center">
          <p className="text-2xl">🐾</p>
          <p className="mt-2 text-sm font-bold text-bc-blue">Nenhum latido encontrado nesta tag.</p>
          <p className="text-xs text-bc-brown/70">
            Seja o primeiro a publicar usando o formulário acima!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <NostrPostCard key={post.id} post={post} onReaction={refreshFeed} />
          ))}
        </div>
      )}

      {/* Modal de Conexão */}
      <NostrAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
