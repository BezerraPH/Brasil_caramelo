"use client";

import { useState } from "react";
import Image from "next/image";
import { nip19 } from "nostr-tools";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { publishNostrReaction } from "@/lib/nostr/events";
import { shortenNpub } from "@/lib/nostr/keys";
import type { NostrPost } from "@/lib/nostr/types";

type Props = {
  post: NostrPost;
  onReaction?: () => void;
};

export function NostrPostCard({ post, onReaction }: Props) {
  const { identity } = useNostrAuth();
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [copied, setCopied] = useState(false);

  const authorName = post.profile?.name || post.profile?.display_name || shortenNpub(post.npub, 6);
  const avatarUrl = post.profile?.picture;
  const breedBadge = post.profile?.dog_breed || "Caramelo Nostr";

  async function handleLike() {
    if (!identity) {
      alert("Conecte sua identidade Nostr para dar biscoitos!");
      return;
    }
    if (reacting || hasLiked) return;

    setReacting(true);
    try {
      await publishNostrReaction({
        targetEventId: post.id,
        targetPubkey: post.pubkey,
        emoji: "🐾",
        identity,
      });
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      onReaction?.();
    } catch {
      // ignore
    } finally {
      setReacting(false);
    }
  }

  async function copyNoteId() {
    try {
      const noteId = nip19.noteEncode(post.id);
      await navigator.clipboard.writeText(noteId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(post.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(post.createdAt));

  return (
    <article className="bc-card bc-card-interactive bc-glass rounded-2xl border border-bc-caramel/25 bg-bc-white p-4 shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-bc-caramel/40 to-bc-green/30">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={authorName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg">🐕</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-bc-blue">{authorName}</span>
              <span className="bc-badge bg-bc-caramel/15 text-[10px] text-bc-brown">
                {breedBadge}
              </span>
            </div>
            <p className="font-mono text-[11px] text-bc-brown/70">{shortenNpub(post.npub, 6)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-bc-brown/60">
          <span title="Assinatura criptográfica Schnorr verificada">🛡️</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="mt-3 text-sm text-bc-brown whitespace-pre-line break-words">
        {post.content}
      </div>

      {post.mediaUrls.length > 0 && (
        <div className="mt-3 grid gap-2">
          {post.mediaUrls.map((url) => (
            <div key={url} className="relative max-h-96 overflow-hidden rounded-xl bg-black/5">
              {url.endsWith(".mp4") || url.endsWith(".webm") ? (
                <video src={url} controls className="w-full rounded-xl" />
              ) : (
                <div className="relative h-64 w-full">
                  <Image
                    src={url}
                    alt="Mídia Nostr"
                    fill
                    className="rounded-xl object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-bc-caramel/15 pt-3 text-xs text-bc-brown">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={reacting}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold transition-all ${
              hasLiked
                ? "bg-bc-caramel/25 text-bc-brown"
                : "hover:bg-bc-caramel/15 hover:text-bc-blue"
            }`}
          >
            <span>🐾</span>
            <span>{likes > 0 ? `${likes} Biscoitos` : "Dar Biscoito"}</span>
          </button>

          {post.profile?.lud16 && (
            <a
              href={`lightning:${post.profile.lud16}`}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 font-bold text-amber-600 hover:bg-amber-500/10"
              title={`Zap Lightning para ${post.profile.lud16}`}
            >
              <span>⚡</span>
              <span>Zap</span>
            </a>
          )}
        </div>

        <button
          onClick={copyNoteId}
          className="text-[11px] text-bc-brown/60 hover:text-bc-blue hover:underline"
        >
          {copied ? "✓ ID Copiado" : "Compartilhar Note"}
        </button>
      </div>
    </article>
  );
}
