"use client";

import type { DogReputationLevel } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { AiCaptionButton } from "./AiCaptionButton";
import { BcImage } from "./BcImage";

type CreatePostFormProps = {
  instaMode?: boolean;
  reelsMode?: boolean;
  communityLevel?: DogReputationLevel;
};

export function CreatePostForm({
  instaMode,
  reelsMode,
  communityLevel,
}: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hasMedia = Boolean(imageUrl || videoUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !hasMedia) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || undefined,
          imageUrl: imageUrl ?? undefined,
          videoUrl: videoUrl ?? undefined,
          communityLevel,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setContent("");
        setImageUrl(null);
        setVideoUrl(null);
        router.refresh();
      } else {
        setError(data.error ?? "Não foi possível publicar.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bc-card p-5">
      <label htmlFor="recado" className="mb-2 block text-sm font-semibold text-bc-blue">
        {reelsMode
          ? "Novo Cinelar"
          : instaMode
            ? "Nova publicação"
            : communityLevel
              ? "Postar na casinha"
              : "Escrever recado"}
      </label>

      {imageUrl && (
        <div className="relative mb-3 aspect-square max-h-64 w-full overflow-hidden rounded-xl bg-bc-blue/5">
          <BcImage src={imageUrl} alt="Prévia" fill className="object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white"
          >
            Remover
          </button>
        </div>
      )}

      {videoUrl && (
        <div className="relative mb-3 aspect-video max-h-64 w-full overflow-hidden rounded-xl bg-black">
          <video src={videoUrl} className="h-full w-full object-cover" controls />
          <button
            type="button"
            onClick={() => setVideoUrl(null)}
            className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white"
          >
            Remover
          </button>
        </div>
      )}

      <textarea
        id="recado"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={instaMode || reelsMode ? 2 : 3}
        placeholder={
          reelsMode
            ? "Legenda do vídeo…"
            : instaMode
              ? "Legenda da foto (opcional)…"
              : "O que você está aprontando hoje?"
        }
        className="w-full resize-none rounded-lg border border-bc-brown/30 p-3 text-sm focus:border-bc-green focus:outline-none focus:ring-2 focus:ring-bc-green/30"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!reelsMode && (
          <UploadButton
            endpoint="postImage"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
              if (url) {
                setImageUrl(url);
                setVideoUrl(null);
              }
            }}
            onUploadError={(e) => setError(e.message)}
            appearance={{
              button:
                "rounded-lg border-2 border-bc-blue/30 bg-bc-white px-3 py-1.5 text-xs font-semibold text-bc-blue",
            }}
            content={{ button: instaMode ? "📷 Foto" : "📷 Foto" }}
          />
        )}
        {(reelsMode || !instaMode) && (
          <UploadButton
            endpoint="postVideo"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
              if (url) {
                setVideoUrl(url);
                setImageUrl(null);
              }
            }}
            onUploadError={(e) => setError(e.message)}
            appearance={{
              button:
                "rounded-lg border-2 border-bc-caramel/40 bg-bc-white px-3 py-1.5 text-xs font-semibold text-bc-caramel",
            }}
            content={{ button: "🎬 Vídeo" }}
          />
        )}
        <AiCaptionButton onCaption={setContent} hint={content || "cachorro"} />
        <button
          type="submit"
          disabled={loading || (!content.trim() && !hasMedia)}
          className="bc-btn-primary ml-auto"
        >
          {loading ? "Publicando…" : "Publicar"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}
