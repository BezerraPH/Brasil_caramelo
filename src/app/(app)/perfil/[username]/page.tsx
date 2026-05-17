import Link from "next/link";
import { notFound } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";
import { ReputationBar } from "@/components/ReputationBar";
import { ReputationPicker } from "@/components/ReputationPicker";
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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <article className="overflow-hidden rounded-2xl border-2 border-bc-blue bg-bc-white shadow-lg">
        <div className="h-24 bg-gradient-to-r from-bc-blue to-bc-green" />
        <div className="relative px-6 pb-6">
          <div className="-mt-12 mb-4 w-fit rounded-full border-4 border-bc-white shadow-md">
            <UserAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size="lg"
            />
          </div>

          <h1 className="text-2xl font-bold text-bc-blue">{profile.name}</h1>
          <p className="text-bc-brown">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-sm text-gray-700">{profile.bio}</p>
          )}
          <p className="mt-1 text-xs text-bc-brown">
            {profile._count.posts} recado
            {profile._count.posts !== 1 ? "s" : ""}
          </p>

          <section className="mt-6 rounded-xl border border-bc-green/30 bg-bc-green/5 p-4">
            <h2 className="mb-2 font-bold text-bc-green">Personalidade canina</h2>
            <ReputationBar summary={summary} />
            {!isOwnProfile && (
              <div className="mt-4 border-t border-bc-green/20 pt-4">
                <ReputationPicker
                  toUserId={profile.id}
                  myLevel={myReputation?.level ?? null}
                />
              </div>
            )}
          </section>

          {recentPosts.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 font-bold text-bc-blue">Últimos recados</h2>
              <ul className="space-y-3">
                {recentPosts.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-lg border border-bc-blue/15 p-3 text-sm"
                  >
                    <p className="whitespace-pre-wrap">{p.content}</p>
                    <time className="mt-1 block text-xs text-bc-brown">
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
    </main>
  );
}
