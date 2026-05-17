import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { ReputationBar } from "@/components/ReputationBar";
import { ReputationPButton } from "@/components/ReputationPButton";
import { UserAvatar } from "@/components/UserAvatar";
import { getCurrentUser } from "@/lib/auth";
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

  const recentPosts = await prisma.post.findMany({
    where: { authorId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, content: true, createdAt: true },
  });

  return (
    <PageContainer narrow>
      <article className="bc-card overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-bc-blue via-bc-green/80 to-bc-caramel/60">
          {!isOwnProfile && (
            <div className="absolute bottom-3 right-4">
              <ReputationPButton
                toUserId={profile.id}
                myLevel={myReputation?.level ?? null}
              />
            </div>
          )}
        </div>

        <div className="relative px-6 pb-6 pt-0">
          <div className="-mt-14 mb-3 flex items-end justify-between gap-4">
            <div className="rounded-full border-4 border-bc-white shadow-lg">
              <UserAvatar
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                size="lg"
              />
            </div>
            {isOwnProfile && (
              <Link href="/configuracoes" className="bc-btn-secondary text-sm">
                Editar perfil
              </Link>
            )}
          </div>

          <h1 className="text-2xl font-bold text-bc-blue">{profile.name}</h1>
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

          {recentPosts.length > 0 && (
            <section className="mt-8 border-t border-bc-blue/10 pt-6">
              <h2 className="mb-3 font-bold text-bc-blue">Últimos recados</h2>
              <ul className="space-y-3">
                {recentPosts.map((p) => (
                  <li key={p.id} className="rounded-xl bg-bc-white/80 p-4 ring-1 ring-bc-blue/10">
                    <p className="whitespace-pre-wrap text-sm">{p.content}</p>
                    <time className="mt-2 block text-xs text-bc-brown">
                      {p.createdAt.toLocaleString("pt-BR")}
                    </time>
                  </li>
                ))}
              </ul>
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
      </article>
    </PageContainer>
  );
}
