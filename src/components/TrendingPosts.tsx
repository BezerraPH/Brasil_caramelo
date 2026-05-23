import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VISIBLE_POST_WHERE } from "@/lib/visible-posts";

export async function TrendingPosts() {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const hot = await prisma.post.findMany({
    where: {
      communityLevel: null,
      createdAt: { gte: since },
      ...VISIBLE_POST_WHERE,
      author: { shadowbanned: false },
    },
    orderBy: { likes: { _count: "desc" } },
    take: 5,
    include: {
      author: { select: { username: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (hot.length === 0) return null;

  return (
    <section className="bc-card bc-animate-in p-4">
      <h2 className="mb-3 font-bold text-bc-blue">🔥 Em alta (7 dias)</h2>
      <ul className="space-y-2">
        {hot.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/feed#post-${p.id}`}
              className="block rounded-lg px-2 py-1.5 text-xs transition hover:bg-bc-green/10"
            >
              <span className="font-bold text-bc-caramel">#{i + 1}</span>{" "}
              <span className="text-bc-blue">{p.author.name}</span>
              <p className="truncate text-bc-brown">
                {p.content.slice(0, 60) || "📷 mídia"}
              </p>
              <p className="text-[10px] text-bc-brown/80">
                ❤️ {p._count.likes} · 💬 {p._count.comments}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
