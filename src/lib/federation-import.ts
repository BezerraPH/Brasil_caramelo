import type { DogReputationLevel } from "@/generated/prisma/enums";
import { prisma } from "./prisma";

export type ExportedFederatedPost = {
  id: string;
  content: string;
  communityLevel: DogReputationLevel;
  createdAt: string;
  author: { username: string; name: string };
};

export async function importPostsFromPeer(
  peerId: string,
  posts: ExportedFederatedPost[],
): Promise<number> {
  let imported = 0;

  for (const p of posts) {
    if (!p.communityLevel || !p.id) continue;

    try {
      await prisma.federatedPostMirror.upsert({
        where: {
          peerId_externalId: { peerId, externalId: p.id },
        },
        create: {
          peerId,
          externalId: p.id,
          content: p.content.slice(0, 2000),
          communityLevel: p.communityLevel,
          authorUsername: p.author.username,
          authorName: p.author.name,
          sourceCreatedAt: new Date(p.createdAt),
        },
        update: {
          content: p.content.slice(0, 2000),
          authorUsername: p.author.username,
          authorName: p.author.name,
        },
      });
      imported += 1;
    } catch {
      /* duplicata ou nível inválido */
    }
  }

  return imported;
}

export async function getFederatedMirrorsForCasinha(
  communityLevel: DogReputationLevel,
  limit = 10,
) {
  return prisma.federatedPostMirror.findMany({
    where: { communityLevel },
    orderBy: { importedAt: "desc" },
    take: limit,
    include: { peer: { select: { name: true } } },
  });
}

export async function getRecentFederatedMirrors(limit = 12) {
  return prisma.federatedPostMirror.findMany({
    orderBy: { importedAt: "desc" },
    take: limit,
    include: {
      peer: { select: { name: true, baseUrl: true } },
    },
  });
}
