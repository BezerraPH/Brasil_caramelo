import "server-only";

import type { CommunityMemberRole } from "@/generated/prisma/enums";
import { resolveCommunityAccess } from "@/lib/community-access";
import { prisma } from "@/lib/prisma";
import type { CommunityCard } from "@/lib/communities-types";

export type { CommunityCard } from "@/lib/communities-types";

const DEFAULT_RULES =
  "Seja gentil com a matilha. Sem spam, sem links suspeitos. Zoeira sim, ofensa não.";

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
        pinnedRules: DEFAULT_RULES,
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
        pinnedRules: DEFAULT_RULES,
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
        pinnedRules: DEFAULT_RULES,
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
        pinnedRules: DEFAULT_RULES,
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
        pinnedRules: DEFAULT_RULES,
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
        pinnedRules: DEFAULT_RULES,
      },
    ],
    skipDuplicates: true,
  });

  const linked = await prisma.community.findMany({
    where: { packId: { not: null }, ownerId: null },
    include: { pack: { select: { ownerId: true } } },
  });
  for (const row of linked) {
    if (row.pack?.ownerId) {
      await prisma.community.update({
        where: { id: row.id },
        data: { ownerId: row.pack.ownerId },
      });
    }
  }
}

function hotScore(counts: {
  members: number;
  threads: number;
  posts: number;
}): number {
  return counts.members * 2 + counts.threads * 5 + counts.posts * 3;
}

export async function listCommunities(
  userId: string | null,
  opts?: { category?: string; query?: string; sort?: string },
): Promise<CommunityCard[]> {
  await ensureCommunitiesSeeded();

  const category =
    opts?.category && opts.category !== "todos" ? opts.category : undefined;
  const q = opts?.query?.trim().toLowerCase();

  const rows = await prisma.community.findMany({
    where: category ? { category } : undefined,
    include: {
      pack: { select: { slug: true } },
      _count: { select: { members: true, threads: true, posts: true } },
      members: userId
        ? { where: { userId }, select: { id: true, role: true }, take: 1 }
        : false,
    },
  });

  type Row = CommunityCard & { _hot: number };
  let mapped: Row[] = rows.map((c) => ({
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
    _hot: hotScore(c._count),
  }));

  if (q) {
    mapped = mapped.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q),
    );
  }

  if (opts?.sort === "hot") {
    mapped.sort((a, b) => b._hot - a._hot || a.name.localeCompare(b.name));
  } else {
    mapped.sort((a, b) => a.name.localeCompare(b.name));
  }

  return mapped.map((row) => {
    const { _hot, ...card } = row;
    return card;
  });
}

export async function getCommunityBySlug(slug: string, userId: string | null) {
  await ensureCommunitiesSeeded();
  const c = await prisma.community.findUnique({
    where: { slug },
    include: {
      owner: { select: { username: true, name: true } },
      pack: { select: { id: true, slug: true, name: true, ownerId: true } },
      _count: { select: { members: true } },
      members: userId
        ? { where: { userId }, select: { id: true, role: true }, take: 1 }
        : false,
    },
  });
  if (!c) return null;

  if (!c.ownerId && c.pack?.ownerId) {
    await prisma.community.update({
      where: { id: c.id },
      data: { ownerId: c.pack.ownerId },
    });
    c.ownerId = c.pack.ownerId;
  }

  const memberRole = (
    userId && Array.isArray(c.members) && c.members[0]
      ? c.members[0].role
      : null
  ) as CommunityMemberRole | null;

  const access =
    userId != null
      ? resolveCommunityAccess(c.ownerId, userId, memberRole)
      : {
          isOwner: false,
          isModerator: false,
          canModerate: false,
          memberRole: null,
        };

  return {
    ...c,
    memberCount: c._count.members,
    isMember: Boolean(
      userId && Array.isArray(c.members) && c.members.length > 0,
    ),
    memberRole,
    ...access,
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
    create: { communityId, userId, role: "MEMBER" },
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

export async function getCommunityForModeration(slug: string, userId: string) {
  const community = await getCommunityBySlug(slug, userId);
  if (!community) return null;
  if (!community.canModerate) return null;
  return community;
}
