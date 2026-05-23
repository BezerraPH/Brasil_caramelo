import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const offspring = await prisma.petOffspring.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { parentAUserId: user.id },
        { parentBUserId: user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  if (offspring.length === 0) {
    return NextResponse.json({ nodes: [] });
  }

  const userIds = new Set<string>();
  for (const o of offspring) {
    userIds.add(o.ownerId);
    userIds.add(o.parentAUserId);
    userIds.add(o.parentBUserId);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
    select: { id: true, name: true, username: true },
  });
  const byId = Object.fromEntries(users.map((u) => [u.id, u]));

  const nodes = offspring.map((o) => {
    const owner = byId[o.ownerId];
    const parentA = byId[o.parentAUserId];
    const parentB = byId[o.parentBUserId];
    if (!owner || !parentA || !parentB) return null;

    const role =
      o.ownerId === user.id
        ? ("owner" as const)
        : ("parent" as const);

    return {
      id: o.id,
      name: o.name,
      color: o.color,
      dnaLevel: o.dnaLevel,
      adoptedAt: o.adoptedAt?.toISOString() ?? null,
      role,
      owner,
      parentA,
      parentB,
    };
  });

  return NextResponse.json({
    stats: {
      asOwner: offspring.filter((o) => o.ownerId === user.id).length,
      asParent: offspring.filter(
        (o) =>
          o.parentAUserId === user.id || o.parentBUserId === user.id,
      ).length,
      total: offspring.length,
    },
    nodes: nodes.filter((n): n is NonNullable<typeof n> => n !== null),
  });
}
