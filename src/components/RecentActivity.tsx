import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

  const [likes, comments] = await Promise.all([
    prisma.like.findMany({
      where: { userId: { in: friendIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, username: true } },
      },
    }),
    prisma.comment.findMany({
      where: { authorId: { in: friendIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true, username: true } },
      },
    }),
  ]);

  const items = [
    ...likes.map((l) => ({
      id: `like-${l.id}`,
      at: l.createdAt,
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
    ...comments.map((c) => ({
      id: `comment-${c.id}`,
      at: c.createdAt,
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
    <section className="bc-card bc-animate-in p-4">
      <h2 className="mb-3 font-bold text-bc-blue">⚡ Atividade da matilha</h2>
      <ul className="space-y-2 text-xs text-bc-brown">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg bg-bc-blue/5 px-2 py-1.5">
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
