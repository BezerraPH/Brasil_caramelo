import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { DOG_REPUTATION_LEVELS } from "@/lib/constants";
import { createFlashEvent, getActiveFlashEvent } from "@/lib/events";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { pushGlobalEvent } from "@/lib/pusher-server";

const createEventSchema = z.object({
  title: z.string().min(3).max(80),
  message: z.string().min(3).max(300),
  durationMinutes: z.number().min(5).max(120).optional(),
  coinMultiplier: z.number().min(1.5).max(5).optional(),
  targetLevel: z.enum(DOG_REPUTATION_LEVELS).optional().nullable(),
  adminSecret: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const event = await getActiveFlashEvent(user.id);
  return NextResponse.json({
    event: event
      ? {
          ...event,
          startsAt: event.startsAt.toISOString(),
          endsAt: event.endsAt.toISOString(),
        }
      : null,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = createEventSchema.parse(await request.json());
    const secret = process.env.EVENT_ADMIN_SECRET;
    const allowed =
      user.isPremium ||
      (secret && body.adminSecret === secret) ||
      process.env.NODE_ENV === "development";

    if (!allowed) {
      return NextResponse.json(
        { error: "Apenas Pedigree ou admin pode iniciar rolezinhos." },
        { status: 403 },
      );
    }

    const event = await createFlashEvent({
      title: body.title,
      message: body.message,
      durationMinutes: body.durationMinutes ?? 15,
      coinMultiplier: body.coinMultiplier ?? 2,
      targetLevel: body.targetLevel ?? null,
    });

    const users = await prisma.user.findMany({ select: { id: true } });
    for (const u of users) {
      await createNotification(
        u.id,
        "FLASH_EVENT",
        `🎉 ${event.title}: ${event.message}`,
        "/rolezinho",
      );
    }

    await pushGlobalEvent("flash-event", {
      id: event.id,
      title: event.title,
      message: event.message,
      coinMultiplier: event.coinMultiplier,
      endsAt: event.endsAt.toISOString(),
    });

    return NextResponse.json({ event });
  } catch {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }
}
