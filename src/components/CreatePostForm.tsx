"use client";

import type { DogReputationLevel } from "@/generated/prisma/enums";
import { formatAchievementToast } from "@/lib/achievement-defs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useVideoHlsPolling } from "@/hooks/use-video-hls-polling";
import { useOfflinePostSubmit } from "@/hooks/use-offline-post-submit";
import { AiCaptionButton } from "./AiCaptionButton";
import { LocalMediaUpload } from "./LocalMediaUpload";
import { BcImage } from "./BcImage";
import { useToast } from "./ToastProvider";

type CreatePostFormProps = {
  instaMode?: boolean;
  reelsMode?: boolean;
  communityLevel?: DogReputationLevel;
};

const MAX_POST_CHARS = 2000;

export function CreatePostForm({
  instaMode,
  reelsMode,
  communityLevel,
}: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [buryBone, setBuryBone] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoHlsUrl, setVideoHlsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const [pollingPostId, setPollingPostId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const submitPost = useOfflinePostSubmit();
  const { processing: videoProcessing } = useVideoHlsPolling(pollingPostId);

  const hasMedia = Boolean(imageUrl || videoUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !hasMedia) return;
    setLoading(true);
    setError(null);
    setPollingPostId(null);
    try {
      const result = await submitPost(
        {
          content: content.trim(),
          imageUrl: imageUrl ?? undefined,
          videoUrl: videoUrl ?? undefined,
          videoHlsUrl: videoHlsUrl ?? undefined,
          communityLevel,
          buryBone: buryBone && !instaMode && !reelsMode ? true : undefined,
        },
        (msg) => setError(msg),
      );
      if (result.status === "ok") {
        for (const key of result.newAchievements) {
          toast(formatAchievementToast(key), "achievement");
        }
        setContent("");
        setImageUrl(null);
        setVideoUrl(null);
        setVideoHlsUrl(null);
        setQueued(false);
        if (result.videoProcessing) {
          setPollingPostId(result.postId);
        }
        router.refresh();
      }
      if (result.status === "queued") {
        setQueued(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const lousaClass = reelsMode
    ? "bc-lousa-reels"
    : instaMode
      ? "bc-lousa-insta"
      : "bc-lousa-orkut";

  return (
    <form onSubmit={handleSubmit} className={`bc-card p-5 ${lousaClass}`}>
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
        maxLength={MAX_POST_CHARS}
        placeholder={
          reelsMode
            ? "Legenda do vídeo…"
            : instaMode
              ? "Legenda da foto (opcional)…"
              : "O que você está aprontando hoje?"
        }
        className={`bc-lousa-textarea w-full resize-none rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 ${
          reelsMode
            ? "border-bc-caramel/40 focus:border-bc-caramel focus:ring-bc-caramel/30"
            : instaMode
              ? "border-bc-blue/20 focus:border-bc-blue focus:ring-bc-blue/20"
              : "border-dashed border-bc-brown/40 bg-[#fffef8] focus:border-bc-green focus:ring-bc-green/30 shadow-inner"
        }`}
      />
      <p
        className={`mt-1 text-right text-[10px] tabular-nums ${
          content.length > MAX_POST_CHARS * 0.9
            ? "font-semibold text-bc-caramel"
            : "text-bc-brown/60"
        }`}
        aria-live="polite"
      >
        {content.length}/{MAX_POST_CHARS}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!reelsMode && (
          <LocalMediaUpload
            kind="postImage"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
            label="📷 Foto"
            className="rounded-lg border-2 border-bc-blue/30 bg-bc-white px-3 py-1.5 text-xs font-semibold text-bc-blue"
            onUploaded={(url) => {
              setImageUrl(url);
              setVideoUrl(null);
              setError(null);
            }}
            onError={setError}
          />
        )}
        {(reelsMode || !instaMode) && (
          <LocalMediaUpload
            kind="postVideo"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
            label="🎬 Vídeo"
            className="rounded-lg border-2 border-bc-caramel/40 bg-bc-white px-3 py-1.5 text-xs font-semibold text-bc-caramel"
            onUploaded={(url, _mime, extra) => {
              setVideoUrl(url);
              setVideoHlsUrl(extra?.hlsUrl ?? null);
              setImageUrl(null);
              setError(null);
            }}
            onError={setError}
          />
        )}
        <AiCaptionButton onCaption={setContent} hint={content || "cachorro"} />
        {!instaMode && !reelsMode && (
          <label className="flex items-center gap-2 text-xs text-bc-brown">
            <input
              type="checkbox"
              checked={buryBone}
              onChange={(e) => setBuryBone(e.target.checked)}
            />
            🦴 Enterrar osso (libera em 30 dias)
          </label>
        )}
        <button
          type="submit"
          disabled={loading || (!content.trim() && !hasMedia)}
          className="bc-btn-primary ml-auto"
        >
          {loading ? "Publicando…" : "Publicar"}
        </button>
      </div>

      {videoProcessing && (
        <p className="bc-video-processing mt-2 text-xs text-bc-caramel bc-animate-in">
          🎬 Otimizando vídeo para streaming…
        </p>
      )}

      {queued && (
        <p className="mt-2 text-xs text-bc-caramel">
          Recado na fila offline — será enviado quando a rede voltar.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}
