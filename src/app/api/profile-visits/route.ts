import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileVisitSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { showVisits: true },
  });

  if (!me?.showVisits) {
    return NextResponse.json({
      enabled: false,
      visitors: [],
      message:
        "Ative visitas recíprocas nas configurações para ver quem passou no seu perfil.",
    });
  }

  const visits = await prisma.profileVisit.findMany({
    where: {
      visitedId: user.id,
      visitor: { showVisits: true },
    },
    orderBy: { visitedAt: "desc" },
    take: 30,
    include: {
      visitor: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json({
    enabled: true,
    visitors: visits.map((v) => ({
      ...v.visitor,
      visitedAt: v.visitedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { visitedId } = profileVisitSchema.parse(body);

    if (visitedId === user.id) {
      return NextResponse.json({ ok: true, recorded: false });
    }

    const visitor = await prisma.user.findUnique({
      where: { id: user.id },
      select: { showVisits: true },
    });

    if (!visitor?.showVisits) {
      return NextResponse.json({ ok: true, recorded: false });
    }

    await prisma.profileVisit.upsert({
      where: {
        visitorId_visitedId: { visitorId: user.id, visitedId },
      },
      create: { visitorId: user.id, visitedId },
      update: { visitedAt: new Date() },
    });

    return NextResponse.json({ ok: true, recorded: true });
  } catch {
    return NextResponse.json({ error: "Visita inválida." }, { status: 400 });
  }
}
