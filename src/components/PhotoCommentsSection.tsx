"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UivoPlayer } from "./UivoPlayer";
import { UserAvatar } from "./UserAvatar";
import { VoiceNoteRecorder } from "./VoiceNoteRecorder";

type PhotoComment = {
  id: string;
  content: string;
  audioUrl?: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

type PhotoCommentsSectionProps = {
  photoId: string;
  initialCount: number;
};

export function PhotoCommentsSection({
  photoId,
  initialCount,
}: PhotoCommentsSectionProps) {
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [count, setCount] = useState(initialCount);
  const [content, setContent] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/albums/photos/${photoId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        setComments(d.comments ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [photoId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !audioUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/photos/${photoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), audioUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((c) => [...c, data.comment]);
        setCount((n) => n + 1);
        setContent("");
        setAudioUrl(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bc-orkut-card space-y-4 p-5">
      <h2 className="text-sm font-bold text-bc-blue">
        Comentários ({count})
      </h2>

      <ul className="max-h-72 space-y-3 overflow-y-auto">
        {!loaded && (
          <li className="text-xs text-bc-brown/70">Carregando…</li>
        )}
        {loaded && comments.length === 0 && (
          <li className="text-xs text-bc-brown/70">
            Seja o primeiro a comentar nesta foto.
          </li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="flex gap-2 text-sm">
            <Link href={`/perfil/${c.author.username}`}>
              <UserAvatar
                name={c.author.name}
                avatarUrl={c.author.avatarUrl}
                size="sm"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/perfil/${c.author.username}`}
                className="font-semibold text-bc-blue hover:underline"
              >
                {c.author.name}
              </Link>
              <p className="text-bc-brown">{c.content}</p>
              {c.audioUrl && <UivoPlayer src={c.audioUrl} className="mt-1" />}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="space-y-2 border-t border-bc-blue/10 pt-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Comentário clássico embaixo da foto…"
          className="bc-input w-full resize-none text-sm"
        />
        <VoiceNoteRecorder
          audioUrl={audioUrl}
          onRecorded={setAudioUrl}
          onClear={() => setAudioUrl(null)}
          maxSeconds={10}
        />
        <button
          type="submit"
          disabled={loading || (!content.trim() && !audioUrl)}
          className="bc-btn-primary text-sm"
        >
          {loading ? "Enviando…" : "Comentar"}
        </button>
      </form>
    </section>
  );
}
