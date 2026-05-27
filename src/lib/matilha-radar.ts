import { prisma } from "./prisma";

export type MatilhaRadarStat = {
  key: "social" | "fofoqueiro" | "criativo" | "polemico" | "engracado" | "tech";
  label: string;
  emoji: string;
  value: number;
};

export type MatilhaRadar = {
  stats: MatilhaRadarStat[];
};

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Raio-X da Matilha — hexágono RPG calculado das interações reais. */
export async function computeMatilhaRadar(userId: string): Promise<MatilhaRadar> {
  const [
    friendCount,
    messagesSent,
    anonThreads,
    testimonialsReceived,
    imagePosts,
    videoPosts,
    postCount,
    biscuitsReceived,
    likesReceived,
    reportsOnPosts,
    borderCollieVotes,
  ] = await Promise.all([
    prisma.friendship.count({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    }),
    prisma.message.count({ where: { senderId: userId } }),
    prisma.thread.count({ where: { authorId: userId, anonymous: true } }),
    prisma.testimonial.count({ where: { toUserId: userId, accepted: true } }),
    prisma.post.count({ where: { authorId: userId, imageUrl: { not: null } } }),
    prisma.post.count({ where: { authorId: userId, videoUrl: { not: null } } }),
    prisma.post.count({ where: { authorId: userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { biscuitBalance: true } }),
    prisma.like.count({ where: { post: { authorId: userId } } }),
    prisma.postReport.count({ where: { post: { authorId: userId } } }),
    prisma.reputation.count({
      where: { toUserId: userId, level: "BORDER_COLLIE" },
    }),
  ]);

  const biscuits = biscuitsReceived?.biscuitBalance ?? 0;

  const stats: MatilhaRadarStat[] = [
    {
      key: "social",
      label: "Social",
      emoji: "🤝",
      value: clamp(friendCount * 8 + messagesSent * 0.4),
    },
    {
      key: "fofoqueiro",
      label: "Fofoqueiro",
      emoji: "🎭",
      value: clamp(anonThreads * 20 + testimonialsReceived * 3),
    },
    {
      key: "criativo",
      label: "Criativo",
      emoji: "🎨",
      value: clamp(imagePosts * 5 + postCount * 0.5),
    },
    {
      key: "polemico",
      label: "Polêmico",
      emoji: "🔥",
      value: clamp(reportsOnPosts * 15 + (postCount > 20 ? 10 : 0)),
    },
    {
      key: "engracado",
      label: "Engraçado",
      emoji: "😂",
      value: clamp(biscuits * 6 + likesReceived * 0.25),
    },
    {
      key: "tech",
      label: "Tech",
      emoji: "💻",
      value: clamp(videoPosts * 8 + borderCollieVotes * 12),
    },
  ];

  return { stats };
}
