import Link from "next/link";
import { CreatePostForm } from "@/components/CreatePostForm";
import { PageContainer } from "@/components/PageContainer";
import { UserAvatar } from "@/components/UserAvatar";
import { FeedPost } from "@/components/FeedPost";
import { RoadmapPanel } from "@/components/RoadmapPanel";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  const friendCount = await prisma.friendship.count({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
  });

  const pendingFriends = await prisma.friendship.count({
    where: { status: "PENDING", addresseeId: user.id },
  });

  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr_260px]">
        <aside className="hidden lg:block">
          <section className="bc-card bc-animate-in p-5 text-center">
            <Link
              href={`/perfil/${user.username}`}
              className="mx-auto mb-3 block w-fit transition hover:scale-105"
            >
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
            </Link>
            <p className="font-bold text-bc-blue">{user.name}</p>
            <p className="text-xs text-bc-brown">@{user.username}</p>
            <p className="mt-2 text-xs text-bc-green">
              {friendCount} amigo{friendCount !== 1 ? "s" : ""}
            </p>
            {pendingFriends > 0 && (
              <Link
                href="/amigos"
                className="mt-2 block rounded-lg bg-bc-caramel/20 px-2 py-1 text-xs font-medium text-bc-brown"
              >
                {pendingFriends} pedido{pendingFriends !== 1 ? "s" : ""} de amizade
              </Link>
            )}
            <Link
              href="/configuracoes"
              className="mt-3 inline-block text-xs font-medium text-bc-blue hover:underline"
            >
              Editar perfil
            </Link>
            <Link
              href="/cachorro"
              className="mt-3 block rounded-lg bg-bc-green/10 px-2 py-2 text-xs font-medium text-bc-green hover:bg-bc-green/20"
            >
              🐕 Meu cachorro
            </Link>
          </section>
        </aside>

        <section className="space-y-4">
          <header className="bc-animate-in">
            <h1 className="text-2xl font-bold text-bc-blue">Recados</h1>
            <p className="text-sm text-bc-brown">O que a comunidade está latindo</p>
          </header>
          <div className="bc-animate-in bc-stagger-1">
            <CreatePostForm />
          </div>
          {posts.length === 0 ? (
            <p className="bc-card bc-animate-in p-10 text-center text-bc-brown">
              Nenhum recado ainda. Seja o primeiro! 🐾
            </p>
          ) : (
            posts.map((post, i) => (
              <FeedPost
                key={post.id}
                animationDelay={i < 6 ? `bc-stagger-${Math.min(i + 2, 5)}` : undefined}
                post={{
                  ...post,
                  createdAt: post.createdAt.toISOString(),
                  likedByMe: post.likes.length > 0,
                }}
              />
            ))
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="bc-animate-in bc-stagger-2">
            <RoadmapPanel />
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
