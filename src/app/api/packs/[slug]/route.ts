import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

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
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: {
            select: { name: true, username: true, avatarUrl: true },
          },
          _count: { select: { replies: true } },
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

  return NextResponse.json({
    pack: {
      id: pack.id,
      slug: pack.slug,
      name: pack.name,
      description: pack.description,
      owner: pack.owner,
      memberCount: pack._count.members,
      joined: !!membership,
      threads: pack.threads.map((t) => ({
        id: t.id,
        title: t.title,
        createdAt: t.createdAt.toISOString(),
        author: t.author,
        replyCount: t._count.replies,
      })),
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
