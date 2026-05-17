import Link from "next/link";
import { CreatePostForm } from "@/components/CreatePostForm";
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_240px]">
        <aside className="hidden lg:block">
          <section className="rounded-xl border-2 border-bc-blue bg-bc-white p-4 text-center shadow-sm">
            <Link
              href={`/perfil/${user.username}`}
              className="mx-auto mb-2 block w-fit"
            >
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
            </Link>
            <p className="font-bold text-bc-blue">{user.name}</p>
            <p className="text-xs text-bc-brown">@{user.username}</p>
            <p className="mt-2 text-xs text-bc-green">
              {friendCount} amigo{friendCount !== 1 ? "s" : ""}
            </p>
            <p className="mt-1 rounded bg-bc-green/10 px-2 py-1 text-xs font-medium text-bc-green">
              Modo Feed ativo
            </p>
          </section>
        </aside>

        <section className="space-y-4">
          <h1 className="text-xl font-bold text-bc-blue">Recados da comunidade</h1>
          <CreatePostForm />
          {posts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-bc-brown/40 p-8 text-center text-bc-brown">
              Nenhum recado ainda. Seja o primeiro a latir algo! 🐾
            </p>
          ) : (
            posts.map((post) => (
              <FeedPost
                key={post.id}
                post={{
                  ...post,
                  createdAt: post.createdAt.toISOString(),
                  likedByMe: post.likes.length > 0,
                }}
              />
            ))
          )}
        </section>

        <div className="hidden lg:block">
          <RoadmapPanel />
        </div>
      </div>
    </main>
  );
}
