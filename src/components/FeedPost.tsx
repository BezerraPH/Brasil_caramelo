"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BcImage } from "./BcImage";
import { CommentSection } from "./CommentSection";
import { DeletePostButton } from "./DeletePostButton";
import { EditPostButton } from "./EditPostButton";
import { PostContent } from "./PostContent";
import { SavePostButton } from "./SavePostButton";
import { SharePostButton } from "./SharePostButton";
import { UserAvatar } from "./UserAvatar";

type FeedPostProps = {
  post: {
    id: string;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
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
  currentUserId?: string;
  animationDelay?: string;
  savedByMe?: boolean;
};

export function FeedPost({
  post,
  currentUserId,
  animationDelay,
  savedByMe,
}: FeedPostProps) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [likeAnim, setLikeAnim] = useState(false);
  const router = useRouter();
  const isOwn = currentUserId === post.author.id;

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
      id={`post-${post.id}`}
      className={`bc-card bc-card-interactive bc-animate-in scroll-mt-24 p-5 ${animationDelay ?? ""}`}
    >
      <header className="mb-3 flex items-center gap-3">
        <Link href={`/perfil/${post.author.username}`}>
          <UserAvatar name={post.author.name} avatarUrl={post.author.avatarUrl} />
        </Link>
        <div className="min-w-0 flex-1">
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
      {post.videoUrl && (
        <div className="relative mb-3 aspect-video max-h-96 w-full overflow-hidden rounded-xl bg-black shadow-inner">
          <video
            src={post.videoUrl}
            className="h-full w-full object-cover"
            controls
            playsInline
          />
        </div>
      )}
      {post.imageUrl && !post.videoUrl && (
        <div className="relative mb-3 aspect-video max-h-96 w-full overflow-hidden rounded-xl bg-bc-blue/5 shadow-inner">
          <BcImage
            src={post.imageUrl}
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 600px"
            className="object-cover transition duration-500 hover:scale-[1.02]"
          />
        </div>
      )}
      {post.content && <PostContent content={post.content} />}
      <footer className="mt-4 border-t border-bc-blue/10 pt-3">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={toggleLike}
            className={`bc-ripple inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              liked
                ? "bg-bc-green/15 text-bc-green"
                : "text-bc-brown hover:bg-bc-brown/10 hover:text-bc-green"
            } ${likeAnim ? "bc-animate-pop" : ""}`}
          >
            {liked ? "❤️" : "🤍"} Legal ({likeCount})
          </button>
          <SavePostButton postId={post.id} initialSaved={savedByMe} />
          <SharePostButton postId={post.id} />
          {isOwn && (post.content || post.imageUrl || post.videoUrl) && (
            <EditPostButton
              postId={post.id}
              initialContent={post.content ?? ""}
            />
          )}
          {isOwn && <DeletePostButton postId={post.id} />}
        </div>
        <CommentSection postId={post.id} initialCount={post._count.comments} />
      </footer>
    </article>
  );
}
