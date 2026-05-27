import { prisma } from "@/lib/prisma";

export type UserDataExport = {
  exportedAt: string;
  format: "brasil-caramelo-gdpr-v1";
  user: Record<string, unknown>;
  posts: unknown[];
  comments: unknown[];
  testimonials: { sent: unknown[]; received: unknown[] };
  friendships: { sent: unknown[]; received: unknown[] };
  albums: unknown[];
  packMemberships: unknown[];
  threads: unknown[];
  replies: unknown[];
  notifications: unknown[];
  pet: unknown | null;
  communities: unknown[];
};

export async function buildUserDataExport(
  userId: string,
): Promise<UserDataExport> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      viewMode: true,
      showVisits: true,
      profileTheme: true,
      locationCity: true,
      locationArea: true,
      showLocation: true,
      birthDate: true,
      relationshipStatus: true,
      interests: true,
      isPremium: true,
      premiumUntil: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const [
    posts,
    comments,
    testimonialsSent,
    testimonialsReceived,
    friendshipsOut,
    friendshipsIn,
    albums,
    packMemberships,
    threads,
    replies,
    notifications,
    pet,
    communities,
  ] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        videoUrl: true,
        videoHlsUrl: true,
        audioUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.comment.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        postId: true,
        content: true,
        createdAt: true,
      },
    }),
    prisma.testimonial.findMany({
      where: { fromUserId: userId },
      select: {
        id: true,
        toUserId: true,
        content: true,
        accepted: true,
        createdAt: true,
      },
    }),
    prisma.testimonial.findMany({
      where: { toUserId: userId },
      select: {
        id: true,
        fromUserId: true,
        content: true,
        accepted: true,
        createdAt: true,
      },
    }),
    prisma.friendship.findMany({
      where: { requesterId: userId },
      select: {
        id: true,
        addresseeId: true,
        status: true,
        requesterDegree: true,
        addresseeDegree: true,
        createdAt: true,
      },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: userId },
      select: {
        id: true,
        requesterId: true,
        status: true,
        requesterDegree: true,
        addresseeDegree: true,
        createdAt: true,
      },
    }),
    prisma.album.findMany({
      where: { userId },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
            thumbUrl: true,
            caption: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.packMember.findMany({
      where: { userId },
      include: { pack: { select: { slug: true, name: true } } },
    }),
    prisma.thread.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        packId: true,
        title: true,
        createdAt: true,
      },
      take: 200,
    }),
    prisma.reply.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        threadId: true,
        content: true,
        createdAt: true,
      },
      take: 500,
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        type: true,
        message: true,
        link: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.pet.findUnique({
      where: { userId },
    }),
    prisma.communityMember.findMany({
      where: { userId },
      include: {
        community: { select: { slug: true, name: true } },
      },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    format: "brasil-caramelo-gdpr-v1",
    user: {
      ...user,
      birthDate: user.birthDate?.toISOString().slice(0, 10) ?? null,
      premiumUntil: user.premiumUntil?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    posts,
    comments,
    testimonials: {
      sent: testimonialsSent,
      received: testimonialsReceived,
    },
    friendships: {
      sent: friendshipsOut,
      received: friendshipsIn,
    },
    albums,
    packMemberships,
    threads,
    replies,
    notifications,
    pet,
    communities: communities.map((m) => ({
      slug: m.community.slug,
      name: m.community.name,
      joinedAt: m.joinedAt.toISOString(),
    })),
  };
}
