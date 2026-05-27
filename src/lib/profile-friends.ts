import { prisma } from "./prisma";

export type ProfileFriendMini = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

/** Amigos aceitos de um usuário (mini grid no perfil Orkut). */
export async function getProfileFriendsPreview(
  userId: string,
  limit = 9,
): Promise<ProfileFriendMini[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      requester: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
      addressee: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });

  return rows.map((f) =>
    f.requesterId === userId ? f.addressee : f.requester,
  );
}
