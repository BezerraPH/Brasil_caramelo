import Link from "next/link";
import { TunelDoTempoCard } from "@/components/TunelDoTempoCard";
import { SorteDoDiaCard } from "@/components/SorteDoDiaCard";
import { DesafioDoDiaCard } from "@/components/DesafioDoDiaCard";
import { FilaPaoDeQueijo } from "@/components/FilaPaoDeQueijo";
import { CreatePostForm } from "@/components/CreatePostForm";
import { OfflinePostBanner } from "@/components/OfflinePostBanner";
import { FeedFilterTabs } from "@/components/FeedFilterTabs";
import { FeedInfinite } from "@/components/FeedInfinite";
import { MatilhaDayGreeting } from "@/components/MatilhaDayGreeting";
import { MatilhaStatsCards } from "@/components/MatilhaStatsCards";
import { NotificationPeek } from "@/components/NotificationPeek";
import { FeedTrendingTags } from "@/components/FeedTrendingTags";
import { FeedRefreshButton } from "@/components/FeedRefreshButton";
import { FlashEventBanner } from "@/components/FlashEventBanner";
import { InstaFeed } from "@/components/InstaFeed";
import { PageContainer } from "@/components/PageContainer";
import { CinelarFeed } from "@/components/CinelarFeed";
import { StoriesBar } from "@/components/StoriesBar";
import { PostScrollOnLoad } from "@/components/PostScrollOnLoad";
import { RecentActivity } from "@/components/RecentActivity";
import { TrendingPosts } from "@/components/TrendingPosts";
import { PetCareBanner } from "@/components/PetCareBanner";
import { FeedQuickDock } from "@/components/FeedQuickDock";
import { PetDailyClaimBanner } from "@/components/PetDailyClaimBanner";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { Suspense } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { getCurrentUser } from "@/lib/auth";
import { getActiveFlashEvent } from "@/lib/events";
import {
  attachSavedFlags,
  fetchFeedPage,
  fetchFeedPostById,
  parseFeedFilter,
} from "@/lib/feed-posts";
import { fetchCinelarFeed } from "@/lib/cinelar-fyp";
import { prisma } from "@/lib/prisma";
import { getOnThisDayMemory } from "@/lib/memories";
import { applyPetDecay, petAvatarStatus } from "@/lib/pet";

type FeedPageProps = {
  searchParams: Promise<{ filter?: string; post?: string }>;
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { filter, post: highlightPostId } = await searchParams;
  const feedFilter = parseFeedFilter(filter);

  const isReelsMode = user.viewMode === "REELS";

  const feedResult = isReelsMode
    ? await fetchCinelarFeed(user.id, null)
    : await fetchFeedPage(user.id, null, {
        friendsOnly: feedFilter === "friends",
        videosOnly: feedFilter === "video",
      });

  const { posts: feedPosts, nextCursor } = feedResult;
  let mappedPosts = await attachSavedFlags(user.id, feedPosts);

  if (highlightPostId && !mappedPosts.some((p) => p.id === highlightPostId)) {
    const highlighted = await fetchFeedPostById(user.id, highlightPostId);
    if (highlighted) {
      const [withSaved] = await attachSavedFlags(user.id, [highlighted]);
      mappedPosts = [withSaved, ...mappedPosts];
    }
  }

  const [friendCount, pendingFriends, flashEvent, viewerPet, memoryPost] =
    await Promise.all([
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
      prisma.pet.findUnique({ where: { userId: user.id } }),
      getOnThisDayMemory(user.id),
    ]);

  let viewerPetStatus = null;
  if (viewerPet) {
    viewerPetStatus = petAvatarStatus(
      applyPetDecay({
        ...viewerPet,
        id: viewerPet.id,
        name: viewerPet.name,
        color: viewerPet.color,
        level: viewerPet.level,
        experience: viewerPet.experience,
        coins: viewerPet.coins,
      }),
    );
  }

  const isInsta = user.viewMode === "INSTA";
  const isReels = user.viewMode === "REELS";

  const title = isReels
    ? "Cinelar"
    : isInsta
      ? "Insta Caramelo"
      : "Recados";
  const subtitle = isReels
    ? "For You da matilha — descoberta + amigos"
    : isInsta
      ? "Grade de fotos da matilha"
      : "O que a comunidade está latindo";

  return (
    <PageContainer className={isReels ? "!max-w-lg !px-2" : ""}>
      {viewerPetStatus &&
        (viewerPetStatus === "hungry" || viewerPetStatus === "starving") && (
          <PetCareBanner status={viewerPetStatus} />
        )}
      <div
        className={
          isReels ? "space-y-3" : "grid gap-6 lg:grid-cols-[240px_1fr_260px]"
        }
      >
        {!isReels && (
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
                  petStatus={viewerPetStatus}
                />
              </Link>
              <p className="font-bold text-bc-blue">{user.name}</p>
              <p className="text-xs text-bc-brown">@{user.username}</p>
              {user.isPremium && (
                <p className="mt-1 text-xs font-semibold text-bc-gold">
                  ★ Pedigree
                </p>
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
              <Link
                href="/latidos"
                className="mt-2 block rounded-lg bg-bc-green/10 px-2 py-2 text-xs font-medium text-bc-green hover:bg-bc-green/15"
              >
                🎙️ Latidos ao vivo
              </Link>
              <Link
                href="/tribunal"
                className="mt-2 block rounded-lg bg-bc-blue/10 px-2 py-2 text-xs font-medium text-bc-blue hover:bg-bc-blue/15"
              >
                ⚖️ Tribunal do Cão
              </Link>
            </section>
          </aside>
        )}

        <section className="space-y-4">
          <Suspense fallback={null}>
            <PostScrollOnLoad />
          </Suspense>
          <header className="bc-page-header bc-animate-in flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="bc-shimmer-text text-2xl font-bold sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 text-sm text-bc-brown">{subtitle}</p>
              {!isReels && <MatilhaDayGreeting name={user.name} />}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FeedRefreshButton />
              {!isReels && (
                <Link
                  href="/buscar"
                  className="bc-btn-ghost text-xs"
                  title="Buscar na matilha"
                >
                  🔍 Buscar
                </Link>
              )}
            </div>
          </header>

          {!isReels && <FeedQuickDock />}
          {!isReels && !isInsta && <SorteDoDiaCard />}
          {!isReels && !isInsta && <DesafioDoDiaCard />}
          {!isReels && !isInsta && <FilaPaoDeQueijo />}
          {!isReels && !isInsta && memoryPost && (
            <TunelDoTempoCard memory={memoryPost} />
          )}
          {!isReels && <OfflinePostBanner />}
          {!isReels && <WelcomeBanner />}
          {!isReels && <PetDailyClaimBanner />}

          {!isReels && flashEvent && (
            <FlashEventBanner
              title={flashEvent.title}
              message={flashEvent.message}
              coinMultiplier={flashEvent.coinMultiplier}
              endsAt={flashEvent.endsAt.toISOString()}
            />
          )}

          {!isReels && <StoriesBar currentUserId={user.id} />}

          {!isReels && !isInsta && (
            <Suspense fallback={null}>
              <FeedFilterTabs />
            </Suspense>
          )}

          <div className="bc-animate-in bc-stagger-1">
            <CreatePostForm instaMode={isInsta} reelsMode={isReels} />
          </div>

          {isReels ? (
            <CinelarFeed
              currentUserId={user.id}
              initialCursor={nextCursor}
              viewerPet={
                viewerPet
                  ? { name: viewerPet.name, color: viewerPet.color }
                  : null
              }
              initialPosts={mappedPosts
                .filter((p) => p.videoUrl)
                .map((p) => ({
                  id: p.id,
                  content: p.content,
                  likedByMe: p.likedByMe,
                  author: p.author,
                  _count: p._count,
                  videoUrl: p.videoUrl!,
                  videoHlsUrl: p.videoHlsUrl ?? null,
                }))}
            />
          ) : isInsta ? (
            <InstaFeed posts={mappedPosts} />
          ) : (
            <FeedInfinite
              initialPosts={mappedPosts}
              initialCursor={nextCursor}
              currentUserId={user.id}
              feedFilter={feedFilter}
            />
          )}
        </section>

        {!isReels && (
          <aside className="hidden lg:block">
            <div className="bc-animate-in bc-stagger-2 space-y-4">
              <MatilhaStatsCards layout="sidebar" />
              <NotificationPeek userId={user.id} />
              <FeedTrendingTags />
              <RecentActivity userId={user.id} />
              <TrendingPosts />
              <Link
                href="/premium"
                className="bc-card block p-4 text-center transition hover:border-bc-gold/40"
              >
                <span className="text-2xl">👑</span>
                <p className="mt-2 font-bold text-bc-gold">Pedigree</p>
                <p className="text-xs text-bc-brown">Apoie a matilha</p>
              </Link>
            </div>
          </aside>
        )}
      </div>
    </PageContainer>
  );
}
