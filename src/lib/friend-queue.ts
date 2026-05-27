import { prisma } from "./prisma";
import { ensureOfficialPacks } from "./pack-seeds";

export type FriendQueueSuggestion = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  sharedPacks: string[];
};

/** Fila do Pão de Queijo — sugestões por Matilhas em comum. */
export async function getMatilhaFriendQueue(userId: string): Promise<{
  count: number;
  suggestions: FriendQueueSuggestion[];
}> {
  await ensureOfficialPacks();

  const myMemberships = await prisma.packMember.findMany({
    where: { userId },
    select: { packId: true, pack: { select: { name: true } } },
  });

  if (myMemberships.length === 0) {
    return { count: 0, suggestions: [] };
  }

  const packIds = myMemberships.map((m) => m.packId);

  const [friendships, candidates] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    }),
    prisma.packMember.findMany({
      where: { packId: { in: packIds }, userId: { not: userId } },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatarUrl: true, shadowbanned: true },
        },
        pack: { select: { name: true } },
      },
    }),
  ]);

  const excluded = new Set<string>([userId]);
  for (const f of friendships) {
    excluded.add(f.requesterId === userId ? f.addresseeId : f.requesterId);
  }

  const byUser = new Map<string, FriendQueueSuggestion>();

  for (const row of candidates) {
    if (row.user.shadowbanned || excluded.has(row.userId)) continue;
    const existing = byUser.get(row.userId);
    if (existing) {
      if (!existing.sharedPacks.includes(row.pack.name)) {
        existing.sharedPacks.push(row.pack.name);
      }
    } else {
      byUser.set(row.userId, {
        id: row.user.id,
        name: row.user.name,
        username: row.user.username,
        avatarUrl: row.user.avatarUrl,
        sharedPacks: [row.pack.name],
      });
    }
  }

  const suggestions = [...byUser.values()]
    .sort((a, b) => b.sharedPacks.length - a.sharedPacks.length)
    .slice(0, 8);

  return { count: suggestions.length, suggestions };
}
