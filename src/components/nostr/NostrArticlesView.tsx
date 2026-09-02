"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { getNostrPool } from "@/lib/nostr/relays";
import { publishNostrArticle } from "@/lib/nostr/events";
import { pubkeyToNpub, shortenNpub } from "@/lib/nostr/keys";
import type { NostrEvent, NostrProfileMetadata } from "@/lib/nostr/types";

type Article = {
  id: string;
  pubkey: string;
  npub: string;
  title: string;
  summary: string;
  image?: string;
  content: string;
  createdAt: number;
  tags: string[][];
  profile?: NostrProfileMetadata;
};

export function NostrArticlesView() {
  const { identity, relays } = useNostrAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de leitura
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Modal de criação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawEventsRef = useRef<NostrEvent[]>([]);
  const profilesMapRef = useRef<Map<string, NostrProfileMetadata>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    let active = true;
    const pool = getNostrPool();
    rawEventsRef.current = [];

    const sub = pool.subscribeMany(
      relays,
      {
        kinds: [30023],
        limit: 30,
      },
      {
        onevent(event: NostrEvent) {
          if (!active) return;
          if (!rawEventsRef.current.some((e) => e.id === event.id)) {
            rawEventsRef.current.push(event);
            rawEventsRef.current.sort((a, b) => b.created_at - a.created_at);

            const titleTag = event.tags.find((t) => t[0] === "title")?.[1] || "Sem título";
            const summaryTag = event.tags.find((t) => t[0] === "summary")?.[1] || "";
            const imageTag = event.tags.find((t) => t[0] === "image")?.[1];
            const npub = pubkeyToNpub(event.pubkey);
            const profile = profilesMapRef.current.get(event.pubkey);

            const art: Article = {
              id: event.id,
              pubkey: event.pubkey,
              npub,
              title: titleTag,
              summary: summaryTag,
              image: imageTag,
              content: event.content,
              createdAt: event.created_at * 1000,
              tags: event.tags,
              profile,
            };

            setArticles((prev) => {
              if (prev.some((a) => a.id === event.id)) return prev;
              return [...prev, art].sort((a, b) => b.createdAt - a.createdAt);
            });

            // Buscar perfil do autor se não houver no mapa
            if (!profilesMapRef.current.has(event.pubkey)) {
              pool
                .get(relays, { kinds: [0], authors: [event.pubkey] })
                .then((profEvent) => {
                  if (active && profEvent?.content) {
                    try {
                      const parsed = JSON.parse(profEvent.content);
                      profilesMapRef.current.set(event.pubkey, parsed);
                      setArticles((curr) =>
                        curr.map((a) => (a.pubkey === event.pubkey ? { ...a, profile: parsed } : a)),
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
          if (active) setLoading(false);
        },
      },
    );

    const timer = setTimeout(() => {
      if (active) setLoading(false);
    }, 4000);

    return () => {
      active = false;
      clearTimeout(timer);
      sub.close();
    };
  }, [relays]);

  async function handlePublishArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !identity) return;

    setPublishing(true);
    setError(null);
    try {
      await publishNostrArticle({
        title: title.trim(),
        summary: summary.trim(),
        image: image.trim(),
        content: content.trim(),
        identity,
        relays,
      });

      setTitle("");
      setSummary("");
      setImage("");
      setContent("");
      setIsCreateOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao publicar artigo.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de Ação Superior */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-bc-blue">📖 Manuais & Artigos da Matilha</h2>
          <p className="text-[11px] text-bc-brown/70">
            Publicações long-form (NIP-23) imutáveis e abertas na rede Nostr
          </p>
        </div>

        {identity && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bc-btn-primary px-3.5 py-1.5 text-xs font-bold shadow-xs flex items-center gap-1"
          >
            <span>✍️</span>
            <span>Escrever Artigo</span>
          </button>
        )}
      </div>

      {/* Lista de Artigos */}
      {loading && articles.length === 0 ? (
        <div className="bc-card rounded-3xl p-8 text-center shadow-xs">
          <p className="text-3xl animate-bounce">📖</p>
          <p className="mt-2 text-xs font-bold text-bc-blue">Buscando manuais e artigos nos relays...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bc-card rounded-3xl p-8 text-center shadow-xs">
          <p className="text-3xl">🦴</p>
          <p className="mt-2 text-sm font-bold text-bc-blue">Nenhum artigo publicado ainda.</p>
          <p className="mt-1 text-xs text-bc-brown/70">
            Compartilhe guias de cuidados, histórias de adoção ou manuais caninos no Nostr!
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {articles.map((art) => {
            const authorName =
              art.profile?.name || art.profile?.display_name || shortenNpub(art.npub, 6);
            const formattedDate = new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
            }).format(new Date(art.createdAt));

            return (
              <article
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bc-card bc-card-interactive cursor-pointer overflow-hidden rounded-3xl border border-bc-caramel/20 bg-bc-white/95 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {art.image && (
                    <div className="relative mb-3 h-32 w-full overflow-hidden rounded-2xl bg-black/5">
                      <Image
                        src={art.image}
                        alt={art.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <h3 className="font-extrabold text-sm text-bc-blue line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  {art.summary && (
                    <p className="mt-1.5 text-xs text-bc-brown/80 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-bc-caramel/10 pt-2 text-[11px] text-bc-brown/70">
                  <span className="font-semibold truncate">@{authorName}</span>
                  <span>{formattedDate}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Leitura de Artigo */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bc-card relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-bc-caramel/30 bg-bc-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-bc-brown/60 hover:bg-black/5 hover:text-bc-brown"
            >
              ✕
            </button>

            {selectedArticle.image && (
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl">
                <Image
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <h1 className="text-xl font-black text-bc-blue leading-tight">
              {selectedArticle.title}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-xs text-bc-brown/70 border-b border-bc-caramel/15 pb-3">
              <Link
                href={`/nostr/p/${selectedArticle.npub}`}
                className="font-bold text-bc-blue hover:underline"
              >
                Por @{selectedArticle.profile?.name || shortenNpub(selectedArticle.npub, 6)}
              </Link>
              <span>•</span>
              <span>
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).format(new Date(selectedArticle.createdAt))}
              </span>
            </div>

            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-bc-brown/90">
              {selectedArticle.content}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Artigo */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bc-card relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-bc-caramel/30 bg-bc-white p-6 shadow-2xl">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-bc-brown/60 hover:bg-black/5 hover:text-bc-brown"
            >
              ✕
            </button>

            <h2 className="text-base font-black text-bc-blue flex items-center gap-2">
              <span>✍️</span>
              <span>Novo Artigo / Manual Canino (NIP-23)</span>
            </h2>

            {error && (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handlePublishArticle} className="mt-4 space-y-3">
              <div>
                <label className="bc-label">Título do Artigo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como Cuidar do seu Vira-Lata Caramelo nos Dias Quentes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bc-input text-xs font-semibold"
                />
              </div>

              <div>
                <label className="bc-label">Resumo / Subtítulo</label>
                <input
                  type="text"
                  placeholder="Breve descrição em 1 ou 2 frases"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="bc-input text-xs"
                />
              </div>

              <div>
                <label className="bc-label">URL da Imagem de Capa</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto-capa.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bc-input text-xs"
                />
              </div>

              <div>
                <label className="bc-label">Conteúdo Completo</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Escreva seu artigo completo aqui..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bc-input text-xs resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bc-caramel/15">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="bc-btn-secondary px-4 py-2 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={publishing || !title.trim() || !content.trim()}
                  className="bc-btn-primary px-5 py-2 text-xs font-bold"
                >
                  {publishing ? "Publicando nos Relays…" : "Publicar Artigo 📖"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
