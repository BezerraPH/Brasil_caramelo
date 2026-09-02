"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { publishNostrNote, publishNostrReaction } from "@/lib/nostr/events";
import { shortenNpub } from "@/lib/nostr/keys";
import { isPostBookmarked, removeBookmark, saveBookmark } from "./NostrBookmarks";
import { NostrZapModal } from "./NostrZapModal";
import type { NostrPost } from "@/lib/nostr/types";

type Props = {
  post: NostrPost;
  onReaction?: () => void;
  onReplyPublished?: () => void;
};

export function NostrPostCard({ post, onReaction, onReplyPublished }: Props) {
  const { identity, relays } = useNostrAuth();
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isPostBookmarked(post.id));

  // Reply state
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [publishingReply, setPublishingReply] = useState(false);

  // Zap modal state
  const [showZapModal, setShowZapModal] = useState(false);

  const authorName = post.profile?.name || post.profile?.display_name || shortenNpub(post.npub, 6);
  const avatarUrl = post.profile?.picture;
  const breedBadge = post.profile?.dog_breed;

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
        relays,
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

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!identity) {
      alert("Conecte sua identidade Nostr para responder!");
      return;
    }
    if (!replyText.trim() || publishingReply) return;

    setPublishingReply(true);
    try {
      await publishNostrNote({
        content: replyText.trim(),
        identity,
        replyToEventId: post.id,
        replyToPubkey: post.pubkey,
        relays,
      });
      setReplyText("");
      setShowReplyBox(false);
      onReplyPublished?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao responder nota.");
    } finally {
      setPublishingReply(false);
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
    <>
      <article className="bc-card rounded-3xl border border-bc-caramel/15 bg-bc-white/95 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
        {/* Header do Autor */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/nostr/p/${post.npub}`}
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-bc-caramel/30 to-bc-green/20 border border-bc-caramel/20 hover:opacity-90 transition-opacity"
            >
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
            </Link>

            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 truncate">
                <Link
                  href={`/nostr/p/${post.npub}`}
                  className="font-bold text-sm text-bc-blue hover:underline truncate"
                >
                  {authorName}
                </Link>
                {breedBadge && (
                  <span className="rounded-full bg-bc-caramel/10 px-2 py-0.5 text-[10px] font-medium text-bc-brown shrink-0">
                    {breedBadge}
                  </span>
                )}
                {post.profile?.nip05 && (
                  <span
                    className="text-[11px] text-emerald-600 font-bold shrink-0"
                    title={`NIP-05: ${post.profile.nip05}`}
                  >
                    ✓
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-bc-brown/60 truncate">{shortenNpub(post.npub, 6)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-bc-brown/60 shrink-0">
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Conteúdo da Nota */}
        <div className="mt-3 text-sm text-bc-brown/90 whitespace-pre-line break-words leading-relaxed">
          {post.content}
        </div>

        {/* Mídias / Imagens */}
        {post.mediaUrls.length > 0 && (
          <div className="mt-3 grid gap-2">
            {post.mediaUrls.map((url) => (
              <div key={url} className="relative max-h-96 overflow-hidden rounded-2xl bg-black/5 border border-bc-caramel/15">
                {url.endsWith(".mp4") || url.endsWith(".webm") ? (
                  <video src={url} controls className="w-full rounded-2xl" />
                ) : (
                  <div className="relative h-64 w-full">
                    <Image
                      src={url}
                      alt="Mídia Nostr"
                      fill
                      className="rounded-2xl object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Barra de Ações (Biscoito, Responder, Zap, Salvar, Compartilhar) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-1.5 border-t border-bc-caramel/10 pt-3 text-xs text-bc-brown">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <button
              onClick={handleLike}
              disabled={reacting}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold transition-all ${
                hasLiked
                  ? "bg-amber-500/20 text-amber-900"
                  : "hover:bg-amber-500/10 hover:text-amber-800"
              }`}
            >
              <span>🐾</span>
              <span>{likes > 0 ? `${likes} Biscoitos` : "Biscoito"}</span>
            </button>

            <button
              onClick={() => setShowReplyBox((v) => !v)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold hover:bg-bc-blue/10 hover:text-bc-blue transition-all"
            >
              <span>💬</span>
              <span>Responder</span>
            </button>

            <button
              type="button"
              onClick={() => setShowZapModal(true)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-amber-700 hover:bg-amber-500/15 transition-all"
              title="Enviar Zap em satoshis via Lightning"
            >
              <span>⚡</span>
              <span>Zap</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (bookmarked) {
                  removeBookmark(post.id);
                  setBookmarked(false);
                } else {
                  saveBookmark(post);
                  setBookmarked(true);
                }
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold transition-all ${
                bookmarked
                  ? "bg-emerald-500/15 text-emerald-800"
                  : "hover:bg-emerald-500/10 hover:text-emerald-800"
              }`}
              title={bookmarked ? "Remover dos salvos" : "Salvar nota"}
            >
              <span>{bookmarked ? "🔖 Salvo" : "🔖 Salvar"}</span>
            </button>
          </div>

          <button
            onClick={copyNoteId}
            className="text-[11px] text-bc-brown/60 hover:text-bc-blue hover:underline px-1 py-0.5"
          >
            {copied ? "✓ ID Copiado" : "Compartilhar"}
          </button>
        </div>

        {/* Caixa de Resposta Rápida (Inline) */}
        {showReplyBox && (
          <form onSubmit={handleSendReply} className="mt-3 border-t border-bc-caramel/10 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Respondendo a @${authorName}...`}
                className="flex-1 rounded-xl border border-bc-caramel/25 bg-bc-sand/30 px-3 py-1.5 text-xs text-bc-brown focus:border-bc-blue focus:bg-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={publishingReply || !replyText.trim()}
                className="rounded-xl bg-bc-blue px-3.5 py-1.5 text-xs font-bold text-white hover:bg-bc-blue/90 disabled:opacity-50"
              >
                {publishingReply ? "..." : "Enviar"}
              </button>
            </div>
          </form>
        )}
      </article>

      {/* Modal de Zap Lightning */}
      <NostrZapModal
        isOpen={showZapModal}
        onClose={() => setShowZapModal(false)}
        targetPubkey={post.pubkey}
        targetProfile={post.profile}
        targetEventId={post.id}
      />
    </>
  );
}
