"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { UserAvatar } from "./UserAvatar";

type ReelPost = {
  id: string;
  content: string;
  videoUrl: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
};

type ReelsFeedProps = {
  posts: ReelPost[];
};

export function ReelsFeed({ posts }: ReelsFeedProps) {
  const withVideo = posts.filter((p) => p.videoUrl);

  if (withVideo.length === 0) {
    return (
      <p className="bc-card p-10 text-center text-bc-brown">
        Nenhum Cinelar ainda. Publique um vídeo curto! 🎬
      </p>
    );
  }

  return (
    <div className="bc-reels-snap mx-auto flex h-[calc(100vh-220px)] max-w-md flex-col gap-4 overflow-y-auto rounded-2xl">
      {withVideo.map((post) => (
        <ReelItem key={post.id} post={post} />
      ))}
    </div>
  );
}

function ReelItem({ post }: { post: ReelPost }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className="bc-reels-item bc-card relative aspect-[9/16] w-full shrink-0 overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={post.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <Link
          href={`/perfil/${post.author.username}`}
          className="mb-2 flex items-center gap-2"
        >
          <UserAvatar name={post.author.name} avatarUrl={post.author.avatarUrl} size="sm" />
          <span className="font-semibold">@{post.author.username}</span>
        </Link>
        {post.content && <p className="text-sm line-clamp-3">{post.content}</p>}
        <p className="mt-2 text-xs opacity-80">
          ❤️ {post._count.likes} · 💬 {post._count.comments}
        </p>
      </div>
    </article>
  );
}
