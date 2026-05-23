"use client";

import Link from "next/link";
import { useState } from "react";
import { BcImage } from "./BcImage";
import { CommentSection } from "./CommentSection";
import { PostContent } from "./PostContent";
import { UserAvatar } from "./UserAvatar";

type InstaPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likedByMe: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
};

type InstaFeedProps = {
  posts: InstaPost[];
};

export function InstaFeed({ posts }: InstaFeedProps) {
  const withImages = posts.filter((p) => p.imageUrl);

  if (withImages.length === 0) {
    return (
      <p className="bc-card p-10 text-center text-bc-brown">
        Nenhuma foto ainda. Publique a primeira! 📷
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-3">
      {withImages.map((post, i) => (
        <InstaTile key={post.id} post={post} delay={i} />
      ))}
    </div>
  );
}

function InstaTile({ post, delay }: { post: InstaPost; delay: number }) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);

  async function toggleLike() {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => (data.liked ? c + 1 : c - 1));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`bc-insta-tile bc-card-interactive bc-animate-in relative aspect-square overflow-hidden rounded-lg bg-bc-blue/10 ${delay < 6 ? `bc-stagger-${Math.min(delay + 1, 5)}` : ""}`}
      >
        {post.imageUrl && (
          <BcImage
            src={post.imageUrl}
            alt=""
            fill
            sizes="(max-width:640px) 50vw, 33vw"
            className="object-cover transition hover:scale-105"
          />
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/40 px-1.5 text-[10px] text-white">
          ❤️ {likeCount}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/70"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div className="bc-insta-modal bc-animate-scale fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(420px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-bc-white shadow-2xl">
            {post.imageUrl && (
              <div className="relative aspect-square w-full bg-black">
                <BcImage src={post.imageUrl} alt="" fill className="object-contain" />
              </div>
            )}
            <div className="p-4">
              <header className="mb-3 flex items-center gap-2">
                <Link href={`/perfil/${post.author.username}`} onClick={() => setOpen(false)}>
                  <UserAvatar name={post.author.name} avatarUrl={post.author.avatarUrl} />
                </Link>
                <Link
                  href={`/perfil/${post.author.username}`}
                  className="font-semibold text-bc-blue hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {post.author.name}
                </Link>
              </header>
              {post.content && (
                <PostContent
                  content={post.content}
                  className="mb-3 text-sm text-bc-brown"
                />
              )}
              <button
                type="button"
                onClick={toggleLike}
                className={`mb-2 text-sm font-medium ${liked ? "text-bc-green" : "text-bc-brown"}`}
              >
                {liked ? "❤️" : "🤍"} {likeCount}
              </button>
              <CommentSection postId={post.id} initialCount={post._count.comments} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
