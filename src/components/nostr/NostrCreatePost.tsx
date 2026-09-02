"use client";

import { useState } from "react";
import Image from "next/image";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { publishNostrNote } from "@/lib/nostr/events";

type Props = {
  onPostPublished?: () => void;
  onOpenAuthModal?: () => void;
};

const QUICK_TAGS = ["#brasilcaramelo", "#viralata", "#pet", "#bitcoin"];

export function NostrCreatePost({ onPostPublished, onOpenAuthModal }: Props) {
  const { identity } = useNostrAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddTag(tag: string) {
    if (!content.includes(tag)) {
      setContent((prev) => (prev ? `${prev.trim()} ${tag}` : tag));
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    if (!identity) {
      onOpenAuthModal?.();
      return;
    }

    setPublishing(true);
    setError(null);
    try {
      let finalContent = content.trim();
      if (imageUrl.trim()) {
        finalContent += `\n${imageUrl.trim()}`;
      }

      await publishNostrNote({
        content: finalContent,
        identity,
      });

      setContent("");
      setImageUrl("");
      setShowMediaInput(false);
      onPostPublished?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao publicar no Nostr.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="bc-card rounded-3xl border border-bc-caramel/20 bg-bc-white/95 p-5 shadow-sm hover:shadow-md transition-all">
      <form onSubmit={handlePublish} className="space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar do Usuário */}
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-bc-caramel/40 to-bc-green/30 border border-bc-caramel/20 flex items-center justify-center text-lg shadow-xs">
            🐕
            {identity && (
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Identidade Nostr Ativa"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <textarea
              rows={2}
              placeholder={
                identity
                  ? "O que o seu caramelo está aprontando hoje? Latidos gravados imutavelmente na rede…"
                  : "Conecte sua identidade Nostr para publicar na rede descentralizada!"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={publishing}
              className="w-full resize-none bg-transparent text-sm text-bc-brown placeholder:text-bc-brown/50 focus:outline-none leading-relaxed"
            />

            {/* Pré-visualização de imagem se houver URL */}
            {imageUrl.trim() && (
              <div className="relative mt-2 max-h-48 w-full overflow-hidden rounded-2xl bg-black/5 border border-bc-caramel/20">
                <div className="relative h-36 w-full">
                  <Image
                    src={imageUrl.trim()}
                    alt="Pré-visualização de mídia"
                    fill
                    className="object-cover rounded-2xl"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-xs text-white hover:bg-black/80"
                  title="Remover mídia"
                >
                  ✕
                </button>
              </div>
            )}

            {showMediaInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="url"
                  placeholder="Cole a URL da imagem ou vídeo (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bc-input flex-1 py-1.5 text-xs"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowMediaInput(false)}
                  className="text-xs text-bc-brown/60 hover:text-bc-brown px-2"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Barra de Ferramentas Inferior */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-bc-caramel/15 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-bc-brown hover:bg-bc-cream hover:text-bc-blue transition-colors"
            >
              <span>📷</span>
              <span>Foto/Vídeo</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 pl-1">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="rounded-full bg-bc-sand/50 px-2 py-0.5 text-[11px] font-medium text-bc-brown hover:bg-bc-caramel/20 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!identity ? (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="bc-btn-secondary px-3.5 py-1.5 text-xs font-bold"
              >
                Conectar Chave ⚡
              </button>
            ) : (
              <button
                type="submit"
                disabled={publishing || !content.trim()}
                className="bc-btn-primary flex items-center gap-1 px-4 py-1.5 text-xs font-bold shadow-md"
              >
                <span>🐾</span>
                <span>{publishing ? "Transmitindo…" : "Latir no Nostr"}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
