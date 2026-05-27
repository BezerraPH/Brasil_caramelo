import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getMatilhaLatidosPath,
  getMatilhaLatidosTokenRoom,
} from "@/lib/matilha-latidos-shared";
import { prisma } from "@/lib/prisma";
import { packEventSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const pack = await prisma.pack.findUnique({ where: { slug } });
  if (!pack) {
    return NextResponse.json({ error: "Matilha não encontrada." }, { status: 404 });
  }

  const events = await prisma.packEvent.findMany({
    where: { packId: pack.id, startsAt: { gte: new Date(Date.now() - 86400000) } },
    orderBy: { startsAt: "asc" },
    include: {
      creator: { select: { name: true, username: true } },
      _count: { select: { rsvps: true } },
      rsvps: {
        where: { userId: user.id },
        select: { id: true, ticketToken: true },
      },
    },
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      startsAt: e.startsAt.toISOString(),
      creator: e.creator,
      rsvpCount: e._count.rsvps,
      myRsvp: e.rsvps[0] ?? null,
      latidosRoom: e.latidosRoom ?? getMatilhaLatidosTokenRoom(slug),
      latidosHref: getMatilhaLatidosPath(slug),
    })),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const pack = await prisma.pack.findUnique({ where: { slug } });
  if (!pack) {
    return NextResponse.json({ error: "Matilha não encontrada." }, { status: 404 });
  }

  const member = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: pack.id, userId: user.id } },
  });
  if (!member) {
    return NextResponse.json(
      { error: "Entre na Matilha para criar encontros." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const data = packEventSchema.parse(body);

    const event = await prisma.packEvent.create({
      data: {
        packId: pack.id,
        creatorId: user.id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        location: data.location.trim(),
        startsAt: new Date(data.startsAt),
        latidosRoom: getMatilhaLatidosTokenRoom(slug),
      },
    });

    return NextResponse.json({ ok: true, eventId: event.id });
  } catch {
    return NextResponse.json({ error: "Encontro inválido." }, { status: 400 });
  }
}
