"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";

import { VoiceNoteRecorder } from "./VoiceNoteRecorder";

type Comment = {
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

type CommentSectionProps = {
  postId: string;
  initialCount: number;
};

export function CommentSection({ postId, initialCount }: CommentSectionProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(initialCount);
  const [content, setContent] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []));
  }, [open, postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !audioUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() || "🎙️", audioUrl }),
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
    <div className="border-t border-bc-blue/10 pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bc-btn-ghost text-bc-brown hover:text-bc-blue"
      >
        💬 {count} comentário{count !== 1 ? "s" : ""}{" "}
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="bc-animate-in mt-3 space-y-3">
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {comments.length === 0 ? (
              <li className="text-xs text-bc-brown/70">Nenhum comentário ainda.</li>
            ) : (
              comments.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-2 rounded-lg bg-bc-white/80 p-2 ring-1 ring-bc-blue/10"
                >
                  <UserAvatar name={c.author.name} avatarUrl={c.author.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/perfil/${c.author.username}`}
                      className="text-xs font-semibold text-bc-blue hover:underline"
                    >
                      {c.author.name}
                    </Link>
                    <p className="text-sm leading-snug">{c.content}</p>
                    {c.audioUrl && (
                      <audio src={c.audioUrl} controls className="mt-1 h-7 max-w-full" />
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
          <form onSubmit={submit} className="space-y-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva um comentário..."
              maxLength={500}
              className="bc-input w-full py-2 text-sm"
            />
            <VoiceNoteRecorder
              audioUrl={audioUrl}
              onRecorded={setAudioUrl}
              onClear={() => setAudioUrl(null)}
            />
            <button
              type="submit"
              disabled={loading || (!content.trim() && !audioUrl)}
              className="bc-btn-primary px-4"
            >
              {loading ? "…" : "Enviar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
