import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

function mapThread(t: {
  id: string;
  title: string;
  createdAt: Date;
  pinned: boolean;
  isGolden: boolean;
  archived: boolean;
  anonymous: boolean;
  author: { name: string; username: string; avatarUrl: string | null };
  _count: { replies: number };
  poll: { id: string } | null;
}) {
  return {
    id: t.id,
    title: t.title,
    createdAt: t.createdAt.toISOString(),
    pinned: t.pinned,
    isGolden: t.isGolden,
    archived: t.archived,
    anonymous: t.anonymous,
    hasPoll: Boolean(t.poll),
    replyCount: t._count.replies,
    author: t.anonymous
      ? { name: "Um Caramelo Misterioso", username: "misterioso", avatarUrl: null }
      : t.author,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;

  const pack = await prisma.pack.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true, username: true } },
      _count: { select: { members: true } },
      threads: {
        orderBy: [{ pinned: "desc" }, { isGolden: "desc" }, { createdAt: "desc" }],
        take: 80,
        include: {
          author: {
            select: { name: true, username: true, avatarUrl: true },
          },
          _count: { select: { replies: true } },
          poll: { select: { id: true } },
        },
      },
    },
  });

  if (!pack) {
    return NextResponse.json({ error: "Matilha não encontrada." }, { status: 404 });
  }

  const membership = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: pack.id, userId: user.id } },
  });

  const mapped = pack.threads.map(mapThread);

  return NextResponse.json({
    pack: {
      id: pack.id,
      slug: pack.slug,
      name: pack.name,
      description: pack.description,
      owner: pack.owner,
      ownerId: pack.ownerId,
      isOwner: pack.ownerId === user.id,
      memberCount: pack._count.members,
      joined: !!membership,
      goldenThreads: mapped.filter((t) => !t.archived && (t.isGolden || t.pinned)),
      activeThreads: mapped.filter((t) => !t.archived && !t.isGolden && !t.pinned),
      archivedThreads: mapped.filter((t) => t.archived),
    },
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;

  const pack = await prisma.pack.findUnique({ where: { slug } });
  if (!pack) {
    return NextResponse.json({ error: "Matilha não encontrada." }, { status: 404 });
  }

  await prisma.packMember.upsert({
    where: { packId_userId: { packId: pack.id, userId: user.id } },
    create: { packId: pack.id, userId: user.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
