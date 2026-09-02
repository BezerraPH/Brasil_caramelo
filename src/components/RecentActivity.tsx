import Link from "next/link";
import { feedPostPath } from "@/lib/feed-post-link";
import { MATILHA_POST_WITH_AUTHOR } from "@/lib/matilha-post-where";
import { prisma } from "@/lib/prisma";

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

export async function RecentActivity({ userId }: { userId: string }) {
  const friendRows = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  const friendIds = friendRows.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId,
  );
  if (friendIds.length === 0) return null;

  const postFilter = { post: MATILHA_POST_WITH_AUTHOR };

  const [likes, comments] = await Promise.all([
    prisma.like.findMany({
      where: { userId: { in: friendIds }, ...postFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, username: true } },
        post: { select: { id: true } },
      },
    }),
    prisma.comment.findMany({
      where: { authorId: { in: friendIds }, ...postFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true, username: true } },
        post: { select: { id: true } },
      },
    }),
  ]);

  const items = [
    ...likes
      .filter((l) => l?.post?.id && l?.user?.username)
      .map((l) => ({
        id: `like-${l.id}`,
        at: l.createdAt instanceof Date ? l.createdAt : new Date(l.createdAt),
        postId: l.post.id,
        text: (
          <>
            <Link
              href={`/perfil/${l.user.username}`}
              className="font-semibold text-bc-blue hover:underline"
            >
              {l.user.name}
            </Link>{" "}
            curtiu um recado
          </>
        ),
      })),
    ...comments
      .filter((c) => c?.post?.id && c?.author?.username)
      .map((c) => ({
        id: `comment-${c.id}`,
        at: c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt),
        postId: c.post.id,
        text: (
          <>
            <Link
              href={`/perfil/${c.author.username}`}
              className="font-semibold text-bc-blue hover:underline"
            >
              {c.author.name}
            </Link>{" "}
            comentou
          </>
        ),
      })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="bc-card bc-activity-panel bc-animate-in p-4">
      <h2 className="mb-3 font-bold text-bc-blue">⚡ Atividade da matilha</h2>
      <ul className="space-y-2 text-xs text-bc-brown">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="bc-activity-row rounded-lg bg-bc-blue/5 px-2 py-1.5 transition hover:bg-bc-blue/10"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span>{item.text}</span>
              <span className="text-[10px] text-bc-brown/60">
                {relativeTime(item.at)}
              </span>
            </div>
            <Link
              href={feedPostPath(item.postId)}
              className="mt-1 inline-block text-[10px] font-semibold text-bc-caramel hover:underline"
            >
              Ver recado →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
