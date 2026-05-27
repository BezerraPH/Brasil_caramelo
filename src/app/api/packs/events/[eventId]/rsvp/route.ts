import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { eventId } = await context.params;

  const event = await prisma.packEvent.findUnique({
    where: { id: eventId },
    include: { pack: { select: { slug: true } } },
  });
  if (!event) {
    return NextResponse.json({ error: "Encontro não encontrado." }, { status: 404 });
  }

  const member = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: event.packId, userId: user.id } },
  });
  if (!member) {
    return NextResponse.json(
      { error: "Entre na Matilha para confirmar presença." },
      { status: 403 },
    );
  }

  const existing = await prisma.packEventRsvp.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (existing) {
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    return NextResponse.json({
      ok: true,
      ticketToken: existing.ticketToken,
      pet: pet
        ? { name: pet.name, color: pet.color, level: pet.level }
        : null,
    });
  }

  const ticketToken = randomBytes(12).toString("hex");
  await prisma.packEventRsvp.create({
    data: { eventId, userId: user.id, ticketToken },
  });

  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });

  await createNotification(
    user.id,
    "PACK_EVENT_REMINDER",
    `Ingresso confirmado: «${event.title}» — ${new Date(event.startsAt).toLocaleDateString("pt-BR")}`,
    `/matilhas/${event.pack.slug}?tab=events`,
  );

  return NextResponse.json({
    ok: true,
    ticketToken,
    pet: pet ? { name: pet.name, color: pet.color, level: pet.level } : null,
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { eventId } = await context.params;

  const rsvp = await prisma.packEventRsvp.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!rsvp) {
    return NextResponse.json({ error: "Sem ingresso." }, { status: 404 });
  }

  const [event, pet, holder] = await Promise.all([
    prisma.packEvent.findUnique({
      where: { id: eventId },
      include: { pack: { select: { name: true, slug: true } } },
    }),
    prisma.pet.findUnique({ where: { userId: user.id } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true } }),
  ]);

  if (!event) {
    return NextResponse.json({ error: "Encontro não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    ticket: {
      token: rsvp.ticketToken,
      event: {
        title: event.title,
        location: event.location,
        startsAt: event.startsAt.toISOString(),
        packName: event.pack.name,
      },
      pet: pet
        ? { name: pet.name, color: pet.color, level: pet.level }
        : { name: "Caramelo", color: "#C68642", level: 1 },
      holder: holder?.name ?? user.name,
    },
  });
}
