"use client";

import { useState } from "react";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { publishNostrNote } from "@/lib/nostr/events";

type Props = {
  onPostPublished?: () => void;
  onOpenAuthModal?: () => void;
};

export function NostrCreatePost({ onPostPublished, onOpenAuthModal }: Props) {
  const { identity } = useNostrAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="bc-card bc-glass rounded-2xl border border-bc-caramel/30 bg-bc-white p-4 shadow-md">
      <form onSubmit={handlePublish} className="space-y-3">
        <div className="flex items-center justify-between border-b border-bc-caramel/15 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐕</span>
            <span className="text-xs font-bold uppercase tracking-wider text-bc-blue">
              Latir no Nostr (Rede Descentralizada)
            </span>
          </div>
          <span className="bc-badge bg-bc-gold/20 text-[10px] text-bc-brown">
            #brasilcaramelo
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <textarea
          rows={3}
          placeholder={
            identity
              ? "O que o seu caramelo está aprontando hoje? Latidos gravados imutavelmente na rede…"
              : "Conecte sua identidade Nostr para publicar na rede descentralizada!"
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={publishing}
          className="bc-input w-full resize-none text-sm"
        />

        {showMediaInput && (
          <input
            type="url"
            placeholder="URL da foto ou vídeo (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bc-input w-full text-xs"
          />
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowMediaInput(!showMediaInput)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-bc-brown hover:bg-bc-caramel/15"
          >
            <span>📷</span>
            <span>{showMediaInput ? "Remover Mídia" : "Adicionar Foto/Vídeo"}</span>
          </button>

          <div className="flex items-center gap-2">
            {!identity && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="bc-btn-secondary px-3 py-1.5 text-xs font-bold"
              >
                Conectar Chave
              </button>
            )}

            <button
              type="submit"
              disabled={publishing || !content.trim()}
              className="bc-btn-primary px-4 py-1.5 text-xs font-bold shadow-md"
            >
              {publishing ? "Assinando e Transmitindo…" : "Publicar no Nostr ⚡"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
