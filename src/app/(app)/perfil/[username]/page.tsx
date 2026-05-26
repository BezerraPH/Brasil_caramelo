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
import { CopyProfileLink } from "@/components/CopyProfileLink";
import { FeedPost } from "@/components/FeedPost";
import { UserAvatar } from "@/components/UserAvatar";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friendship";
import { getPersonalityTheme } from "@/lib/personality-theme";
import { prisma } from "@/lib/prisma";
import { VISIBLE_POST_WHERE } from "@/lib/visible-posts";
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

  const [friendCount, myReputation, acceptedTestimonials, viewerPrivacy] =
    await Promise.all([
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
  ]);

  const summary = summarizeReputation(
    profile.reputationsReceived.map((r) => r.level),
  );
  const isOwnProfile = profile.id === viewer.id;
  const isFriend =
    !isOwnProfile && (await areFriends(viewer.id, profile.id));
  const theme = getPersonalityTheme(summary.dominant?.level);

  const recentPosts = await prisma.post.findMany({
    where: { authorId: profile.id, communityLevel: null, ...VISIBLE_POST_WHERE },
    orderBy: { createdAt: "desc" },
    take: 5,
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

  return (
    <PageContainer narrow className="bc-profile-page">
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
            background: theme
              ? `linear-gradient(120deg, ${theme.accent} 0%, ${theme.accentSoft} 40%, #2d8b57 100%)`
              : undefined,
          }}
        >
          {!theme && (
            <div className="absolute inset-0 bg-gradient-to-r from-bc-blue via-bc-green/80 to-bc-caramel/60" />
          )}
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
              style={theme ? { borderColor: theme.accent } : undefined}
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

          <h1
            className="text-2xl font-bold"
            style={{ color: theme?.accent ?? "var(--bc-blue)" }}
          >
            {profile.name}
          </h1>
          <p className="text-bc-brown">@{profile.username}</p>
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

          <TestimonialsSection
            toUserId={profile.id}
            toUsername={profile.username}
            accepted={acceptedTestimonials.map((t) => ({
              ...t,
              acceptedAt: t.acceptedAt?.toISOString() ?? null,
            }))}
            canWrite={!isOwnProfile && isFriend}
          />

          <AchievementBadges userId={profile.id} />

          {profilePosts.length > 0 && (
            <section className="mt-8 space-y-4 border-t border-bc-blue/10 pt-6">
              <h2 className="font-bold text-bc-blue">Últimos recados</h2>
              {profilePosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  currentUserId={viewer.id}
                />
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
