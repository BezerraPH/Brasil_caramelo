"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BcImage } from "./BcImage";
import { CommentSection } from "./CommentSection";
import { UserAvatar } from "./UserAvatar";

type FeedPostProps = {
  post: {
    id: string;
    content: string;
    imageUrl?: string | null;
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
  animationDelay?: string;
};

export function FeedPost({ post, animationDelay }: FeedPostProps) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [likeAnim, setLikeAnim] = useState(false);
  const router = useRouter();

  async function toggleLike() {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => (data.liked ? c + 1 : c - 1));
    if (data.liked) {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 400);
    }
    router.refresh();
  }

  const date = new Date(post.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={`bc-card bc-card-interactive bc-animate-in p-5 ${animationDelay ?? ""}`}
    >
      <header className="mb-3 flex items-center gap-3">
        <Link href={`/perfil/${post.author.username}`}>
          <UserAvatar name={post.author.name} avatarUrl={post.author.avatarUrl} />
        </Link>
        <div>
          <Link
            href={`/perfil/${post.author.username}`}
            className="font-semibold text-bc-blue hover:underline"
          >
            {post.author.name}
          </Link>
          <p className="text-xs text-bc-brown">
            @{post.author.username} · {date}
          </p>
        </div>
      </header>
      {post.imageUrl && (
        <div className="relative mb-3 aspect-video max-h-96 w-full overflow-hidden rounded-xl bg-bc-blue/5">
          <BcImage
            src={post.imageUrl}
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      )}
      {post.content && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {post.content}
        </p>
      )}
      <footer className="mt-4">
        <button
          type="button"
          onClick={toggleLike}
          className={`mb-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition ${
            liked
              ? "bg-bc-green/15 text-bc-green"
              : "text-bc-brown hover:bg-bc-brown/10 hover:text-bc-green"
          } ${likeAnim ? "bc-animate-pop" : ""}`}
        >
          {liked ? "❤️" : "🤍"} Legal ({likeCount})
        </button>
        <CommentSection postId={post.id} initialCount={post._count.comments} />
      </footer>
    </article>
  );
}
