import "server-only";

import { prisma } from "@/lib/prisma";
import type { CommunityCard } from "@/lib/communities-types";

export type { CommunityCard } from "@/lib/communities-types";

export async function ensureCommunitiesSeeded(): Promise<void> {
  const count = await prisma.community.count();
  if (count > 0) return;
  await prisma.community.createMany({
    data: [
      {
        id: "cmty_musica",
        slug: "musica-brasileira",
        name: "Música Brasileira",
        description: "MPB, sertanejo, pagode e playlists da matilha.",
        emoji: "🎵",
        category: "musica",
        themePrimary: "#6b21a8",
        themeAccent: "#fbbf24",
      },
      {
        id: "cmty_caes",
        slug: "cachorros-pe",
        name: "Cachorros de PE",
        description: "Quem tem caramelo no Nordeste se reúne aqui.",
        emoji: "🐕",
        category: "pets",
        themePrimary: "#005f38",
        themeAccent: "#ffc72c",
      },
      {
        id: "cmty_games",
        slug: "games-retro",
        name: "Games Retrô",
        description: "Orkut, LAN house e pixel art — nostalgia pura.",
        emoji: "🎮",
        category: "games",
        themePrimary: "#1e3a5f",
        themeAccent: "#22d3ee",
      },
      {
        id: "cmty_futebol",
        slug: "futebol-brasil",
        name: "Futebol Brasil",
        description: "Zoeira de vestiário, escalação e memes de VAR.",
        emoji: "⚽",
        category: "esportes",
        themePrimary: "#166534",
        themeAccent: "#fef08a",
      },
      {
        id: "cmty_receitas",
        slug: "receitas-pet",
        name: "Receitas Pet",
        description: "Petiscos caseiros e dicas de veterinário amigo.",
        emoji: "🍖",
        category: "pets",
        themePrimary: "#9a3412",
        themeAccent: "#fed7aa",
      },
      {
        id: "cmty_memes",
        slug: "memes-caramelo",
        name: "Memes Caramelo",
        description: "O melhor do Brasil Caramelo em imagem e vídeo.",
        emoji: "😂",
        category: "humor",
        themePrimary: "#c68642",
        themeAccent: "#002776",
      },
    ],
    skipDuplicates: true,
  });
}

export async function listCommunities(
  userId: string | null,
  category?: string,
): Promise<CommunityCard[]> {
  await ensureCommunitiesSeeded();

  const rows = await prisma.community.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: "asc" },
    include: {
      pack: { select: { slug: true } },
      _count: { select: { members: true } },
      members: userId
        ? { where: { userId }, select: { id: true }, take: 1 }
        : false,
    },
  });

  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    emoji: c.emoji,
    category: c.category,
    themePrimary: c.themePrimary,
    themeAccent: c.themeAccent,
    memberCount: c._count.members,
    packSlug: c.pack?.slug ?? null,
    isMember: Boolean(
      userId && Array.isArray(c.members) && c.members.length > 0,
    ),
  }));
}

export async function getCommunityBySlug(
  slug: string,
  userId: string | null,
) {
  await ensureCommunitiesSeeded();
  const c = await prisma.community.findUnique({
    where: { slug },
    include: {
      pack: { select: { id: true, slug: true, name: true } },
      _count: { select: { members: true } },
      members: userId
        ? { where: { userId }, select: { id: true }, take: 1 }
        : false,
    },
  });
  if (!c) return null;
  return {
    ...c,
    memberCount: c._count.members,
    isMember: Boolean(
      userId && Array.isArray(c.members) && c.members.length > 0,
    ),
  };
}

export async function joinCommunity(
  communityId: string,
  userId: string,
): Promise<void> {
  await prisma.communityMember.upsert({
    where: {
      communityId_userId: { communityId, userId },
    },
    create: { communityId, userId },
    update: {},
  });
}

export async function leaveCommunity(
  communityId: string,
  userId: string,
): Promise<void> {
  await prisma.communityMember.deleteMany({
    where: { communityId, userId },
  });
}

