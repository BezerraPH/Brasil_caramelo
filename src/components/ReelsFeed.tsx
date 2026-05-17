"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostContent } from "./PostContent";
import { useToast } from "./ToastProvider";
import { UserAvatar } from "./UserAvatar";

type ReelPost = {
  id: string;
  content: string;
  videoUrl: string;
  likedByMe: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
};

type ReelsFeedProps = {
  posts: ReelPost[];
  currentUserId: string;
};

export function ReelsFeed({ posts, currentUserId }: ReelsFeedProps) {
  const withVideo = posts.filter((p) => p.videoUrl);

  if (withVideo.length === 0) {
    return (
      <p className="bc-card mx-4 p-10 text-center text-bc-brown md:mx-auto md:max-w-md">
        Nenhum Cinelar ainda. Publique um vídeo curto! 🎬
      </p>
    );
  }

  return (
    <div className="bc-cinelar-shell mx-auto w-full max-w-lg">
      <div className="bc-cinelar-scroll bc-reels-snap flex h-[calc(100dvh-11rem)] flex-col overflow-y-auto scroll-smooth md:h-[calc(100vh-12rem)] md:rounded-2xl">
        {withVideo.map((post) => (
          <ReelItem
            key={post.id}
            post={post}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

function ReelItem({ post }: { post: ReelPost; currentUserId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef(0);
  const router = useRouter();
  const toast = useToast();

  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [muted, setMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<
    { id: string; content: string; author: { name: string; username: string } }[]
  >([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const el = ref.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          video.muted = muted;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.55, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [muted]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const toggleLike = useCallback(async () => {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => (data.liked ? c + 1 : Math.max(0, c - 1)));
  }, [post.id]);

  function onVideoTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) void toggleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
    }
    lastTap.current = now;
  }

  async function share() {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Brasil Caramelo", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link copiado!");
    } catch {
      /* cancelado */
    }
  }

  async function openComments() {
    setCommentsOpen(true);
    const res = await fetch(`/api/posts/${post.id}/comments`);
    const data = await res.json();
    if (res.ok) setComments(data.comments);
  }

  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    if (res.ok) {
      setCommentText("");
      openComments();
      router.refresh();
    }
  }

  return (
    <article
      ref={ref}
      id={`post-${post.id}`}
      className="bc-reels-item bc-cinelar-slide relative aspect-[9/16] w-full shrink-0 overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={post.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
        onClick={onVideoTap}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress((v.currentTime / v.duration) * 100);
        }}
      />

      {showHeart && (
        <span className="bc-cinelar-heart-pop pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl">
          ❤️
        </span>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      <div className="absolute bottom-0 left-0 right-14 p-4 text-white">
        <Link
          href={`/perfil/${post.author.username}`}
          className="pointer-events-auto mb-2 flex items-center gap-2"
        >
          <UserAvatar
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
            size="sm"
          />
          <span className="text-sm font-bold drop-shadow">@{post.author.username}</span>
        </Link>
        {post.content && (
          <PostContent
            content={post.content}
            className="pointer-events-auto line-clamp-2 text-sm text-white drop-shadow [&_.bc-hashtag]:text-bc-caramel"
          />
        )}
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-bc-caramel transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        </div>

      <aside className="bc-cinelar-rail absolute bottom-20 right-2 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => void toggleLike()}
          className="bc-cinelar-action"
          aria-pressed={liked}
        >
          <span className="text-2xl">{liked ? "❤️" : "🤍"}</span>
          <span>{likeCount}</span>
        </button>
        <button type="button" onClick={openComments} className="bc-cinelar-action">
          <span className="text-2xl">💬</span>
          <span>{post._count.comments}</span>
        </button>
        <button type="button" onClick={() => void share()} className="bc-cinelar-action">
          <span className="text-2xl">↗</span>
          <span>Enviar</span>
        </button>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="bc-cinelar-action"
          aria-label={muted ? "Ativar som" : "Silenciar"}
        >
          <span className="text-2xl">{muted ? "🔇" : "🔊"}</span>
        </button>
      </aside>

      {commentsOpen && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/50">
          <div className="bc-cinelar-sheet max-h-[55%] rounded-t-2xl bg-bc-white p-4 text-foreground">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-bc-blue">Comentários</h3>
              <button
                type="button"
                onClick={() => setCommentsOpen(false)}
                className="text-bc-brown"
              >
                ✕
              </button>
            </div>
            <ul className="mb-3 max-h-40 space-y-2 overflow-y-auto text-sm">
              {comments.length === 0 && (
                <li className="text-bc-brown">Seja o primeiro a comentar.</li>
              )}
              {comments.map((c) => (
                <li key={c.id}>
                  <span className="font-semibold text-bc-blue">@{c.author.username}</span>{" "}
                  {c.content}
                </li>
              ))}
            </ul>
            <form onSubmit={sendComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Comentar…"
                className="bc-input flex-1"
              />
              <button type="submit" className="bc-btn-primary shrink-0">
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
