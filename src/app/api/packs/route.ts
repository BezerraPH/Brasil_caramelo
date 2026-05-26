import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureOfficialPacks } from "@/lib/pack-seeds";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await ensureOfficialPacks();

  const packs = await prisma.pack.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { members: true, threads: true } },
    },
  });

  const memberships = await prisma.packMember.findMany({
    where: { userId: user.id },
    select: { packId: true },
  });
  const joined = new Set(memberships.map((m) => m.packId));

  return NextResponse.json({
    packs: packs.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      memberCount: p._count.members,
      threadCount: p._count.threads,
      joined: joined.has(p.id),
    })),
  });
}
