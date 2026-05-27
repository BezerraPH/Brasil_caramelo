import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureOfficialPacks } from "@/lib/pack-seeds";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await ensureOfficialPacks();

  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "default";
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  let packs = await prisma.pack.findMany({
    include: {
      _count: { select: { members: true, threads: true } },
    },
  });

  if (q) {
    packs = packs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }

  if (sort === "members") {
    packs.sort((a, b) => b._count.members - a._count.members);
  } else if (sort === "newest") {
    packs.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } else {
    packs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

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
      createdAt: p.createdAt.toISOString(),
    })),
  });
}
