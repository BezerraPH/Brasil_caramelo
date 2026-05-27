import type { FriendshipDegree } from "@/generated/prisma/enums";
import { myFriendshipDegree } from "./friendship-degree";
import { prisma } from "./prisma";
import { ensureOfficialPacks } from "./pack-seeds";

export type FriendQueueSuggestion = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  sharedPacks: string[];
  /** Pontuação para ordenação (Matilhas + vínculos fortes). */
  queueScore: number;
  mutualBestFriends: number;
};

/** Fila do Pão de Queijo — sugestões por Matilhas em comum + graus de amizade. */
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
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: {
        requesterId: true,
        addresseeId: true,
        requesterDegree: true,
        addresseeDegree: true,
      },
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
  const myFriendDegrees = new Map<string, FriendshipDegree>();

  for (const f of friendships) {
    const otherId = f.requesterId === userId ? f.addresseeId : f.requesterId;
    excluded.add(otherId);
    myFriendDegrees.set(otherId, myFriendshipDegree(f, userId));
  }

  const byUser = new Map<
    string,
    Omit<FriendQueueSuggestion, "queueScore" | "mutualBestFriends">
  >();

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

  const candidateIds = [...byUser.keys()];
  if (candidateIds.length === 0) {
    return { count: 0, suggestions: [] };
  }

  const mutualLinks = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: { in: candidateIds }, addresseeId: { in: [...myFriendDegrees.keys()] } },
        { addresseeId: { in: candidateIds }, requesterId: { in: [...myFriendDegrees.keys()] } },
      ],
    },
    select: {
      requesterId: true,
      addresseeId: true,
      requesterDegree: true,
      addresseeDegree: true,
    },
  });

  const mutualBestByCandidate = new Map<string, number>();

  for (const link of mutualLinks) {
    for (const candidateId of candidateIds) {
      let mutualId: string | null = null;
      if (link.requesterId === candidateId) mutualId = link.addresseeId;
      else if (link.addresseeId === candidateId) mutualId = link.requesterId;
      if (!mutualId || !myFriendDegrees.has(mutualId)) continue;

      const myDeg = myFriendDegrees.get(mutualId)!;
      const theirDeg =
        link.requesterId === candidateId
          ? link.requesterDegree
          : link.addresseeDegree;

      if (myDeg === "BEST_FRIEND" || theirDeg === "BEST_FRIEND") {
        mutualBestByCandidate.set(
          candidateId,
          (mutualBestByCandidate.get(candidateId) ?? 0) + 1,
        );
      }
    }
  }

  const suggestions: FriendQueueSuggestion[] = [...byUser.entries()].map(
    ([id, base]) => {
      const mutualBestFriends = mutualBestByCandidate.get(id) ?? 0;
      const queueScore =
        base.sharedPacks.length * 10 + mutualBestFriends * 12;
      return {
        ...base,
        mutualBestFriends,
        queueScore,
      };
    },
  );

  suggestions.sort((a, b) => b.queueScore - a.queueScore);

  const top = suggestions.slice(0, 8);
  return { count: top.length, suggestions: top };
}

/** Ordena amigos no quintal: Melhor Amigo primeiro, depois Amigo, Fã. */
export function sortFriendsByDegree<T extends { id: string }>(
  friends: T[],
  degreeByUserId: Map<string, FriendshipDegree>,
): T[] {
  const weight = (id: string) => {
    const d = degreeByUserId.get(id);
    if (d === "BEST_FRIEND") return 3;
    if (d === "FRIEND") return 2;
    if (d === "FAN") return 1;
    return 0;
  };
  return [...friends].sort((a, b) => weight(b.id) - weight(a.id));
}
