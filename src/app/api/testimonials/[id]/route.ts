import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: {
      fromUser: { select: { id: true, username: true, name: true } },
    },
  });

  if (!testimonial || testimonial.toUserId !== user.id) {
    return NextResponse.json({ error: "Depoimento não encontrado." }, { status: 404 });
  }

  if (testimonial.accepted) {
    return NextResponse.json({ ok: true });
  }

  await prisma.testimonial.update({
    where: { id },
    data: { accepted: true, acceptedAt: new Date() },
  });

  await createNotification(
    testimonial.fromUserId,
    "TESTIMONIAL_ACCEPTED",
    `${user.name} aceitou seu depoimento!`,
    `/perfil/${user.username}`,
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial || testimonial.toUserId !== user.id) {
    return NextResponse.json({ error: "Depoimento não encontrado." }, { status: 404 });
  }

  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
