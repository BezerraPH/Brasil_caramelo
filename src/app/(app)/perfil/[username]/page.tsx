import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { PersonalityProfileCard } from "@/components/PersonalityProfileCard";
import { ProfileMatilhaStats } from "@/components/ProfileMatilhaStats";
import { ProfileQuickLinks } from "@/components/ProfileQuickLinks";
import { ProfileVisitTracker } from "@/components/ProfileVisitTracker";
import { ProfileVisitorsPanel } from "@/components/ProfileVisitorsPanel";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PetYardVisit } from "@/components/PetYardVisit";
import { ReputationBar } from "@/components/ReputationBar";
import { ReputationPButton } from "@/components/ReputationPButton";
import { AchievementBadges } from "@/components/AchievementBadges";
import { MatilhaRadarChart } from "@/components/MatilhaRadarChart";
import { PatioKingBadge } from "@/components/PatioKingBadge";
import { ProfileMediaGrid } from "@/components/ProfileMediaGrid";
import { AlbumPhotosGrid } from "@/components/AlbumPhotosGrid";
import { ProfilePetHighlight } from "@/components/ProfilePetHighlight";
import { CopyProfileLink } from "@/components/CopyProfileLink";
import { FeedPost } from "@/components/FeedPost";
import { UserAvatar } from "@/components/UserAvatar";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friendship";
import { getPersonalityTheme } from "@/lib/personality-theme";
import { prisma } from "@/lib/prisma";
import { FoundingMemberBadge } from "@/components/FoundingMemberBadge";
import { CarameloRadarBadge } from "@/components/CarameloRadarBadge";
import { CarameloVerificadoBadge } from "@/components/CarameloVerificadoBadge";
import {
  ProfileOrkutView,
  ProfileOrkutBioCard,
  ProfileOrkutScrapsSection,
} from "@/components/ProfileOrkutView";
import { computeMatilhaRadar } from "@/lib/matilha-radar";
import { computeCarameloTier } from "@/lib/caramelo-tier";
import { getProfileFriendsPreview } from "@/lib/profile-friends";
import { getRecentAlbumPhotos } from "@/lib/album-photos";
import { isPatioKing, PROFILE_VIBE_LABELS } from "@/lib/profile-vibe";
import { VISIBLE_POST_WHERE, capsuleVisibleWhere } from "@/lib/visible-posts";
import { PROFILE_THEME_BY_ID } from "@/lib/profile-themes";
import { summarizeReputation } from "@/lib/reputation";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const viewer = await getCurrentUser();
  if (!viewer) return null;

  const profile = await prisma.user.findUnique({
    where: { username },
    include: {
      reputationsReceived: { select: { level: true } },
      _count: { select: { posts: true } },
    },
  });

  if (!profile) notFound();

  void checkAndUnlockAchievements(profile.id);

  const isOwnProfile = profile.id === viewer.id;

  const [
    friendCount,
    myReputation,
    acceptedTestimonials,
    viewerPrivacy,
    radar,
    profilePet,
    mediaPosts,
    carameloTier,
    profileFriends,
    pendingFriends,
    albumPhotos,
  ] = await Promise.all([
    prisma.friendship.count({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: profile.id }, { addresseeId: profile.id }],
      },
    }),
    prisma.reputation.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: viewer.id,
          toUserId: profile.id,
        },
      },
    }),
    prisma.testimonial.findMany({
      where: { toUserId: profile.id, accepted: true },
      orderBy: { acceptedAt: "desc" },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: viewer.id },
      select: { showVisits: true },
    }),
    computeMatilhaRadar(profile.id),
    prisma.pet.findUnique({ where: { userId: profile.id } }),
    prisma.post.findMany({
      where: {
        authorId: profile.id,
        communityLevel: null,
        ...VISIBLE_POST_WHERE,
        AND: [
          capsuleVisibleWhere(viewer.id),
          { OR: [{ imageUrl: { not: null } }, { videoUrl: { not: null } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        videoUrl: true,
        videoHlsUrl: true,
        createdAt: true,
      },
    }),
    computeCarameloTier(profile.id),
    getProfileFriendsPreview(profile.id),
    isOwnProfile
      ? prisma.friendship.count({
          where: { status: "PENDING", addresseeId: profile.id },
        })
      : Promise.resolve(0),
    getRecentAlbumPhotos(profile.id, 12),
  ]);

  const summary = summarizeReputation(
    profile.reputationsReceived.map((r) => r.level),
  );
  const isFriend =
    !isOwnProfile && (await areFriends(viewer.id, profile.id));
  const theme = getPersonalityTheme(summary.dominant?.level);
  const palette =
    PROFILE_THEME_BY_ID[profile.profileTheme] ?? PROFILE_THEME_BY_ID.CLASSIC;
  const vibe = profile.profileVibe;
  const showKing = isPatioKing(profile.patioKingUntil);

  const recentPosts = await prisma.post.findMany({
    where: {
      authorId: profile.id,
      communityLevel: null,
      ...VISIBLE_POST_WHERE,
      AND: [capsuleVisibleWhere(viewer.id)],
    },
    orderBy: { createdAt: "desc" },
    take: vibe === "FEED" ? 10 : 5,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: viewer.id }, select: { id: true } },
    },
  });

  const profilePosts = recentPosts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    boostedUntil: p.boostedUntil?.toISOString() ?? null,
    likedByMe: p.likes.length > 0,
  }));

  const mediaMapped = mediaPosts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  const testimonialsBlock = (
    <TestimonialsSection
      toUserId={profile.id}
      toUsername={profile.username}
      accepted={acceptedTestimonials.map((t) => ({
        ...t,
        acceptedAt: t.acceptedAt?.toISOString() ?? null,
      }))}
      canWrite={!isOwnProfile && isFriend}
    />
  );

  if (vibe === "FEED") {
    return (
      <PageContainer className="bc-profile-page bc-profile-vibe-feed">
        {!isOwnProfile && (
          <ProfileVisitTracker
            visitedId={profile.id}
            enabled={viewerPrivacy?.showVisits ?? true}
          />
        )}

        <header className="bc-orkut-card mb-4 overflow-hidden p-0">
          <div
            className={`relative h-20 ${summary.dominant?.level === "HUSKY" ? "bc-profile-banner--husky" : ""}`}
            style={{ background: palette.banner }}
          >
            {theme?.pattern && theme.pattern !== "none" && (
              <div
                className="absolute inset-0 opacity-60"
                style={{ background: theme.pattern }}
              />
            )}
            {!isOwnProfile && (
              <div className="absolute bottom-2 right-3 z-10">
                <ReputationPButton
                  key={myReputation?.level ?? "none"}
                  toUserId={profile.id}
                  myLevel={myReputation?.level ?? null}
                />
              </div>
            )}
          </div>
          <div className="px-4 py-2">
            <p className="text-xs text-bc-brown">
              Perfil Orkut · {profile.name}
              {summary.dominant && (
                <span className="ml-2">
                  DNA {summary.dominant.breed} {summary.dominant.emoji}
                </span>
              )}
            </p>
          </div>
        </header>

        <ProfileOrkutView
          profile={{
            id: profile.id,
            name: profile.name,
            username: profile.username,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            birthDate: profile.birthDate,
            relationshipStatus: profile.relationshipStatus,
            locationCity: profile.locationCity,
            locationArea: profile.locationArea,
            showLocation: profile.showLocation,
            interests: profile.interests,
            isFoundingMember: profile.isFoundingMember,
            biscuitBalance: profile.biscuitBalance,
            isPremium: profile.isPremium,
            createdAt: profile.createdAt,
          }}
          isOwnProfile={isOwnProfile}
          isFriend={isFriend}
          friendCount={friendCount}
          friends={profileFriends}
          pendingFriends={pendingFriends}
          carameloTier={carameloTier}
          showKing={showKing}
          accentColor={palette.accent}
          centerContent={
            <>
              {profile.bio && <ProfileOrkutBioCard bio={profile.bio} />}

              <section className="bc-orkut-card p-5">
                <ReputationBar summary={summary} />
                {!isOwnProfile && (
                  <p className="mt-2 text-center text-xs text-bc-brown/80">
                    Toque no botão <strong className="text-bc-blue">P</strong>{" "}
                    para votar na personalidade
                  </p>
                )}
              </section>

              {testimonialsBlock}

              <section className="bc-orkut-card p-5">
                <MatilhaRadarChart stats={radar.stats} />
              </section>

              {profilePosts.length > 0 ? (
                <ProfileOrkutScrapsSection title="Scraps (recados)">
                  {profilePosts.map((post) => (
                    <FeedPost
                      key={post.id}
                      post={post}
                      currentUserId={viewer.id}
                      scrapMode
                    />
                  ))}
                </ProfileOrkutScrapsSection>
              ) : (
                <section className="bc-orkut-card p-5 text-center text-sm text-bc-brown/80">
                  Nenhum scrap publicado ainda.
                </section>
              )}
            </>
          }
          rightExtras={
            <>
              {isOwnProfile && <ProfileVisitorsPanel />}
              {!isOwnProfile && <PetYardVisit ownerUserId={profile.id} />}
              <AchievementBadges userId={profile.id} />
              <section className="bc-orkut-card p-4">
                <h2 className="mb-2 text-sm font-bold text-bc-blue">
                  Matilha
                </h2>
                <ProfileMatilhaStats
                  postCount={profile._count.posts}
                  friendCount={friendCount}
                  memberSince={profile.createdAt}
                  isPremium={profile.isPremium}
                />
                <Link
                  href="/matilhas"
                  className="bc-btn-secondary mt-3 inline-flex w-full justify-center text-xs"
                >
                  Ver Matilhas →
                </Link>
              </section>
            </>
          }
        />

        {!isOwnProfile && (
          <Link
            href="/feed"
            className="mt-6 inline-block text-sm text-bc-blue hover:underline"
          >
            ← Voltar ao feed
          </Link>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow className={`bc-profile-page bc-profile-vibe-${vibe.toLowerCase()}`}>
      {!isOwnProfile && (
        <ProfileVisitTracker
          visitedId={profile.id}
          enabled={viewerPrivacy?.showVisits ?? true}
        />
      )}
      <PersonalityProfileCard dominantLevel={summary.dominant?.level}>
        <div
          className={`relative h-28 ${summary.dominant?.level === "HUSKY" ? "bc-profile-banner--husky" : ""}`}
          style={{
            background: palette.banner,
          }}
        >
          {theme?.pattern && theme.pattern !== "none" && (
            <div
              className="absolute inset-0 opacity-60"
              style={{ background: theme.pattern }}
            />
          )}
          {!isOwnProfile && (
            <div className="absolute bottom-3 right-4 z-10">
              <ReputationPButton
                key={myReputation?.level ?? "none"}
                toUserId={profile.id}
                myLevel={myReputation?.level ?? null}
              />
            </div>
          )}
        </div>

        <div className="relative px-6 pb-6 pt-0">
          <div className="-mt-14 mb-3 flex items-end justify-between gap-4">
            <div
              className="rounded-full border-4 border-bc-white shadow-lg"
              style={{ borderColor: palette.accent }}
            >
              <UserAvatar
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                size="lg"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {isOwnProfile && (
                <>
                  <Link href="/configuracoes" className="bc-btn-secondary text-sm">
                    Editar perfil
                  </Link>
                  <CopyProfileLink username={profile.username} />
                </>
              )}
              {isFriend && (
                <Link
                  href={`/mensagens?with=${profile.username}`}
                  className="bc-btn-primary text-sm"
                >
                  💬 Mensagem
                </Link>
              )}
              {summary.dominant && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: theme?.accent }}
                >
                  DNA {summary.dominant.breed} {summary.dominant.emoji}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1
              className="text-2xl font-bold"
              style={{ color: palette.accent }}
            >
              {profile.name}
            </h1>
            {profile.isFoundingMember && <FoundingMemberBadge />}
            <CarameloVerificadoBadge tier={carameloTier} />
            {showKing && <PatioKingBadge />}
          </div>
          <p className="text-bc-brown">
            @{profile.username} · Vibe {PROFILE_VIBE_LABELS[vibe]}
          </p>
          {isOwnProfile && profile.biscuitBalance > 0 && (
            <p className="mt-1 text-xs text-bc-caramel">
              🍪 {profile.biscuitBalance} biscoito{profile.biscuitBalance !== 1 ? "s" : ""} recebidos
            </p>
          )}
          {profile.bio && (
            <p className="mt-3 text-sm leading-relaxed text-bc-brown">
              {profile.bio}
            </p>
          )}

          <ProfileMatilhaStats
            postCount={profile._count.posts}
            friendCount={friendCount}
            memberSince={profile.createdAt}
            isPremium={profile.isPremium}
          />

          {isOwnProfile && <ProfileQuickLinks />}
          {isOwnProfile && <ProfileVisitorsPanel />}

          {vibe === "INSTA" && profilePet && (
            <ProfilePetHighlight
              petName={profilePet.name}
              petColor={profilePet.color}
              level={profilePet.level}
            />
          )}

          {vibe === "INSTA" && (
            <section className="mt-6">
              <h2 className="mb-3 font-bold text-bc-blue">Grid de fotos</h2>
              <ProfileMediaGrid posts={mediaMapped} mode="INSTA" />
              <AlbumPhotosGrid photos={albumPhotos} />
            </section>
          )}

          {vibe === "REELS" && (
            <section className="mt-6">
              <h2 className="mb-3 font-bold text-bc-blue">Vídeos curtos</h2>
              <ProfileMediaGrid posts={mediaMapped} mode="REELS" />
            </section>
          )}

          <section className="mt-6">
            <MatilhaRadarChart stats={radar.stats} />
          </section>

          <section className="mt-6">
            <ReputationBar summary={summary} />
            {!isOwnProfile && (
              <p className="mt-3 text-center text-xs text-bc-brown/80">
                Toque no botão <strong className="text-bc-blue">P</strong> para
                votar na personalidade
              </p>
            )}
          </section>

          {!isOwnProfile && <PetYardVisit ownerUserId={profile.id} />}

          {testimonialsBlock}

          <AchievementBadges userId={profile.id} />

          {(vibe === "INSTA") && profilePosts.length > 0 && (
            <section className="mt-8 space-y-4 border-t border-bc-blue/10 pt-6">
              <h2 className="font-bold text-bc-blue">Legenda recente</h2>
              {profilePosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  currentUserId={viewer.id}
                />
              ))}
            </section>
          )}

          {vibe === "REELS" && profilePosts.filter((p) => p.videoUrl).length === 0 && profilePosts.length > 0 && (
            <section className="mt-8 space-y-4 border-t border-bc-blue/10 pt-6">
              <h2 className="font-bold text-bc-blue">Recados</h2>
              {profilePosts.map((post) => (
                <FeedPost key={post.id} post={post} currentUserId={viewer.id} />
              ))}
            </section>
          )}

          {!isOwnProfile && (
            <Link
              href="/feed"
              className="mt-6 inline-block text-sm text-bc-blue hover:underline"
            >
              ← Voltar ao feed
            </Link>
          )}
        </div>
      </PersonalityProfileCard>
    </PageContainer>
  );
}
