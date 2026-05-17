import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { PersonalityProfileCard } from "@/components/PersonalityProfileCard";
import { PetYardVisit } from "@/components/PetYardVisit";
import { ReputationBar } from "@/components/ReputationBar";
import { ReputationPButton } from "@/components/ReputationPButton";
import { FeedPost } from "@/components/FeedPost";
import { UserAvatar } from "@/components/UserAvatar";
import { getCurrentUser } from "@/lib/auth";
import { getPersonalityTheme } from "@/lib/personality-theme";
import { prisma } from "@/lib/prisma";
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

  const myReputation = await prisma.reputation.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: viewer.id,
        toUserId: profile.id,
      },
    },
  });

  const summary = summarizeReputation(
    profile.reputationsReceived.map((r) => r.level),
  );
  const isOwnProfile = profile.id === viewer.id;
  const theme = getPersonalityTheme(summary.dominant?.level);

  const recentPosts = await prisma.post.findMany({
    where: { authorId: profile.id, communityLevel: null },
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
    likedByMe: p.likes.length > 0,
  }));

  return (
    <PageContainer narrow>
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
                <Link href="/configuracoes" className="bc-btn-secondary text-sm">
                  Editar perfil
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
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              {profile.bio}
            </p>
          )}
          <p className="mt-2 text-xs text-bc-brown">
            {profile._count.posts} recado
            {profile._count.posts !== 1 ? "s" : ""}
          </p>

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
