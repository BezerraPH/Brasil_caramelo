"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocalMediaUpload } from "./LocalMediaUpload";

type AlbumPhotoUploaderProps = {
  albumId: string;
};

export function AlbumPhotoUploader({ albumId }: AlbumPhotoUploaderProps) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    url: string;
    thumbUrl: string | null;
  } | null>(null);

  async function savePhoto(url: string, thumbUrl: string | null) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/albums/${albumId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          thumbUrl,
          caption: caption.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao salvar foto.");
        return;
      }
      setCaption("");
      setPending(null);
      router.refresh();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bc-card mb-6 space-y-3 p-4">
      <h2 className="text-sm font-bold text-bc-blue">Adicionar foto</h2>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={500}
        placeholder="Legenda (opcional)…"
        className="bc-input text-sm"
      />
      <LocalMediaUpload
        kind="albumPhoto"
        accept="image/jpeg,image/png,image/webp,image/gif"
        label={saving ? "Salvando…" : "📷 Escolher foto"}
        disabled={saving}
        onError={setError}
        onUploaded={(url, _mime, extra) => {
          const thumbUrl = extra?.thumbUrl ?? null;
          setPending({ url, thumbUrl });
          void savePhoto(url, thumbUrl);
        }}
      />
      {pending && saving && (
        <p className="text-xs text-bc-brown">Enviando para o álbum…</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
