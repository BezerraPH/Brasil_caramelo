import Link from "next/link";
import { notFound } from "next/navigation";
import { CreatePostForm } from "@/components/CreatePostForm";
import { FeedPost } from "@/components/FeedPost";
import { PageContainer } from "@/components/PageContainer";
import { CASINHA_BY_SLUG } from "@/lib/casinhas";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ slug: string }> };

export default async function CasinhaPage({ params }: PageProps) {
  const { slug } = await params;
  const casinha = CASINHA_BY_SLUG[slug];
  if (!casinha) notFound();

  const user = await getCurrentUser();
  if (!user) return null;

  const posts = await prisma.post.findMany({
    where: { communityLevel: casinha.level },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          isPremium: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  return (
    <PageContainer>
      <header
        className={`bc-animate-in mb-6 rounded-2xl border-2 bg-gradient-to-r ${casinha.gradient} p-6`}
        style={{ borderColor: casinha.accent }}
      >
        <span className="text-5xl">{casinha.emoji}</span>
        <h1 className="mt-2 text-3xl font-bold" style={{ color: casinha.accent }}>
          {casinha.name}
        </h1>
        <p className="text-bc-brown">{casinha.tagline}</p>
        <p className="mt-2 text-sm text-bc-blue/90">{casinha.rules}</p>
        <Link
          href={`/mensagens?tab=rooms&room=${casinha.slug}`}
          className="bc-btn-primary mt-4 inline-flex items-center gap-2"
        >
          💬 Sala de chat ao vivo
        </Link>
      </header>

      <CreatePostForm communityLevel={casinha.level} />

      <section className="mt-6 space-y-4">
        {posts.length === 0 ? (
          <p className="bc-card p-8 text-center text-bc-brown">
            Ninguém latindo aqui ainda. Seja o primeiro da casinha!
          </p>
        ) : (
          posts.map((post, i) => (
            <FeedPost
              key={post.id}
              animationDelay={i < 5 ? `bc-stagger-${i + 1}` : undefined}
              post={{
                ...post,
                createdAt: post.createdAt.toISOString(),
                likedByMe: post.likes.length > 0,
              }}
            />
          ))
        )}
      </section>
    </PageContainer>
  );
}
