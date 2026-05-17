import Link from "next/link";
import { CreatePostForm } from "@/components/CreatePostForm";
import { FeedRefreshButton } from "@/components/FeedRefreshButton";
import { FlashEventBanner } from "@/components/FlashEventBanner";
import { FeedPost } from "@/components/FeedPost";
import { InstaFeed } from "@/components/InstaFeed";
import { PageContainer } from "@/components/PageContainer";
import { ReelsFeed } from "@/components/ReelsFeed";
import { RoadmapPanel } from "@/components/RoadmapPanel";
import { StoriesBar } from "@/components/StoriesBar";
import { PostScrollOnLoad } from "@/components/PostScrollOnLoad";
import { RecentActivity } from "@/components/RecentActivity";
import { TrendingPosts } from "@/components/TrendingPosts";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { Suspense } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { getCurrentUser } from "@/lib/auth";
import { finalizeExpiredBattles } from "@/lib/battles";
import { purgeExpiredStories } from "@/lib/cleanup";
import { getActiveFlashEvent } from "@/lib/events";
import { prisma } from "@/lib/prisma";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await Promise.all([finalizeExpiredBattles(), purgeExpiredStories()]);

  const posts = await prisma.post.findMany({
    where: { communityLevel: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          isPremium: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  const [friendCount, pendingFriends, flashEvent] = await Promise.all([
    prisma.friendship.count({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
    }),
    prisma.friendship.count({
      where: { status: "PENDING", addresseeId: user.id },
    }),
    getActiveFlashEvent(user.id),
  ]);

  const savedIds = new Set(
    (
      await prisma.savedPost.findMany({
        where: { userId: user.id, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      })
    ).map((s) => s.postId),
  );

  const mappedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    likedByMe: post.likes.length > 0,
    savedByMe: savedIds.has(post.id),
  }));

  const isInsta = user.viewMode === "INSTA";
  const isReels = user.viewMode === "REELS";

  const title = isReels
    ? "Cinelar"
    : isInsta
      ? "Insta Caramelo"
      : "Recados";
  const subtitle = isReels
    ? "Shorts da matilha — role até o próximo"
    : isInsta
      ? "Grade de fotos da matilha"
      : "O que a comunidade está latindo";

  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr_260px]">
        <aside className="hidden lg:block">
          <section className="bc-card bc-glass bc-animate-in p-5 text-center">
            <Link
              href={`/perfil/${user.username}`}
              className="mx-auto mb-3 block w-fit transition hover:scale-105"
            >
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="md"
                isPremium={user.isPremium}
              />
            </Link>
            <p className="font-bold text-bc-blue">{user.name}</p>
            <p className="text-xs text-bc-brown">@{user.username}</p>
            {user.isPremium && (
              <p className="mt-1 text-xs font-semibold text-bc-gold">★ Pedigree</p>
            )}
            <p className="mt-2 text-xs text-bc-green">
              {friendCount} amigo{friendCount !== 1 ? "s" : ""}
            </p>
            {pendingFriends > 0 && (
              <Link
                href="/amigos"
                className="mt-2 block rounded-lg bg-bc-caramel/20 px-2 py-1 text-xs font-medium text-bc-brown"
              >
                {pendingFriends} pedido{pendingFriends !== 1 ? "s" : ""}
              </Link>
            )}
            <Link
              href="/casinhas"
              className="mt-3 block rounded-lg bg-bc-blue/10 px-2 py-2 text-xs font-medium text-bc-blue hover:bg-bc-blue/15"
            >
              🏠 Casinhas
            </Link>
            <Link
              href="/rolezinho"
              className="mt-2 block rounded-lg bg-bc-gold/15 px-2 py-2 text-xs font-medium text-bc-brown"
            >
              🎉 Rolezinho
            </Link>
            <Link
              href="/batalha"
              className="mt-2 block rounded-lg bg-bc-caramel/15 px-2 py-2 text-xs font-medium text-bc-brown"
            >
              ⚔️ Batalha de pets
            </Link>
          </section>
        </aside>

        <section className="space-y-4">
          <Suspense fallback={null}>
            <PostScrollOnLoad />
          </Suspense>
          <header className="bc-page-header bc-animate-in flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="bc-shimmer-text text-2xl font-bold sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-bc-brown">{subtitle}</p>
            </div>
            <FeedRefreshButton />
          </header>

          <WelcomeBanner />

          {flashEvent && (
            <FlashEventBanner
              title={flashEvent.title}
              message={flashEvent.message}
              coinMultiplier={flashEvent.coinMultiplier}
              endsAt={flashEvent.endsAt.toISOString()}
            />
          )}

          <StoriesBar currentUserId={user.id} />

          <div className="bc-animate-in bc-stagger-1">
            <CreatePostForm instaMode={isInsta} reelsMode={isReels} />
          </div>

          {isReels ? (
            <ReelsFeed
              posts={mappedPosts
                .filter((p) => p.videoUrl)
                .map((p) => ({
                  ...p,
                  videoUrl: p.videoUrl!,
                }))}
            />
          ) : isInsta ? (
            <InstaFeed posts={mappedPosts} />
          ) : posts.length === 0 ? (
            <p className="bc-card bc-animate-in p-10 text-center text-bc-brown">
              Nenhum recado ainda. Seja o primeiro! 🐾
            </p>
          ) : (
            posts.map((post, i) => (
              <FeedPost
                key={post.id}
                animationDelay={
                  i < 6 ? `bc-stagger-${Math.min(i + 2, 5)}` : undefined
                }
                post={mappedPosts[i]}
                currentUserId={user.id}
                savedByMe={mappedPosts[i].savedByMe}
              />
            ))
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="bc-animate-in bc-stagger-2 space-y-4">
            <RecentActivity userId={user.id} />
            <TrendingPosts />
            <RoadmapPanel />
            <Link href="/premium" className="bc-card block p-4 text-center transition hover:border-bc-gold/40">
              <span className="text-2xl">👑</span>
              <p className="mt-2 font-bold text-bc-gold">Pedigree</p>
              <p className="text-xs text-bc-brown">Apoie a matilha</p>
            </Link>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
