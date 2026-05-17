"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserAvatar } from "./UserAvatar";

type FeedPostProps = {
  post: {
    id: string;
    content: string;
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
};

export function FeedPost({ post }: FeedPostProps) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const router = useRouter();

  async function toggleLike() {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => (data.liked ? c + 1 : c - 1));
    router.refresh();
  }

  const date = new Date(post.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="bc-card p-5">
      <header className="mb-3 flex items-center gap-3">
        <UserAvatar name={post.author.name} avatarUrl={post.author.avatarUrl} />
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
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
        {post.content}
      </p>
      <footer className="mt-4 flex gap-4 border-t border-bc-blue/10 pt-3 text-sm">
        <button
          type="button"
          onClick={toggleLike}
          className={`font-medium transition ${
            liked ? "text-bc-green" : "text-bc-brown hover:text-bc-green"
          }`}
        >
          {liked ? "❤️" : "🤍"} Legal ({likeCount})
        </button>
        <span className="text-bc-brown/60">
          💬 {post._count.comments} comentários
        </span>
      </footer>
    </article>
  );
}
