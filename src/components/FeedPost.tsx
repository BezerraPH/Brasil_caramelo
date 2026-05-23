"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PetAvatarStatus } from "@/lib/pet";
import { BcImage } from "./BcImage";
import { BcVideo } from "./BcVideo";
import { CommentSection } from "./CommentSection";
import { DeletePostButton } from "./DeletePostButton";
import { EditPostButton } from "./EditPostButton";
import { PostContent } from "./PostContent";
import { ReactionPicker } from "./ReactionPicker";
import { ReportPostButton } from "./ReportPostButton";
import { SavePostButton } from "./SavePostButton";
import { PostBoostButton } from "./PostBoostButton";
import { SharePostButton } from "./SharePostButton";
import { UserAvatar } from "./UserAvatar";

type FeedPostProps = {
  post: {
    id: string;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    videoHlsUrl?: string | null;
    boostedUntil?: string | null;
    tribunalOpen?: boolean;
    createdAt: string;
    likedByMe: boolean;
    author: {
      id: string;
      name: string;
      username: string;
      avatarUrl: string | null;
      isPremium?: boolean;
      petStatus?: PetAvatarStatus | null;
    };
    _count: { likes: number; comments: number };
  };
  currentUserId?: string;
  myReaction?: string | null;
  animationDelay?: string;
  savedByMe?: boolean;
  searchHighlight?: string;
};

export function FeedPost({
  post,
  currentUserId,
  myReaction,
  animationDelay,
  savedByMe,
  searchHighlight,
}: FeedPostProps) {
  const router = useRouter();
  const isOwn = currentUserId === post.author.id;

  const date = new Date(post.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isBoosted = Boolean(
    post.boostedUntil && new Date(post.boostedUntil) > new Date(),
  );
  const tribunalOpen = Boolean(post.tribunalOpen);

  return (
    <article
      id={`post-${post.id}`}
      className={`bc-card bc-card-interactive bc-animate-in scroll-mt-24 p-5 ${isBoosted ? "bc-post-boosted" : ""} ${tribunalOpen ? "bc-post-tribunal-open" : ""} ${animationDelay ?? ""}`}
    >
      {isBoosted && (
        <span className="bc-boost-ribbon" aria-label="Recado impulsionado">
          🚀 Destaque
        </span>
      )}
      {tribunalOpen && (
        <span className="bc-tribunal-ribbon" aria-label="Em julgamento no Tribunal">
          ⚖️ Tribunal
        </span>
      )}
      <header className="mb-3 flex items-center gap-3">
        <Link href={`/perfil/${post.author.username}`}>
          <UserAvatar
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
            isPremium={post.author.isPremium}
            petStatus={post.author.petStatus}
          />
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
        {isOwn && (
          <PostBoostButton
            postId={post.id}
            boostedUntil={post.boostedUntil ?? null}
          />
        )}
      </header>
      {post.videoUrl && (
        <div className="relative mb-3 aspect-video max-h-96 w-full overflow-hidden rounded-xl bg-black shadow-inner">
          {post.videoHlsUrl && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-bc-caramel">
              HLS
            </span>
          )}
          <BcVideo
            src={post.videoUrl}
            hlsSrc={post.videoHlsUrl}
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
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
      {post.content && (
        <PostContent content={post.content} highlightQuery={searchHighlight} />
      )}
      <footer className="mt-4 border-t border-bc-blue/10 pt-3">
        <div className="flex flex-wrap items-center gap-1">
          <ReactionPicker
            postId={post.id}
            initialReaction={myReaction ?? (post.likedByMe ? "HEART" : null)}
            initialCount={post._count.likes}
            onUpdate={() => router.refresh()}
          />
          <SavePostButton postId={post.id} initialSaved={savedByMe} />
          <SharePostButton postId={post.id} />
          {!isOwn && <ReportPostButton postId={post.id} />}
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
