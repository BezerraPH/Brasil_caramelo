import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const toUserId = searchParams.get("toUserId");
  const mode = searchParams.get("mode");

  if (mode === "pending") {
    const pending = await prisma.testimonial.findMany({
      where: { toUserId: user.id, accepted: false },
      orderBy: { createdAt: "asc" },
      include: {
        fromUser: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });
    return NextResponse.json({ pending });
  }

  if (!toUserId) {
    return NextResponse.json({ error: "toUserId obrigatório." }, { status: 400 });
  }

  const accepted = await prisma.testimonial.findMany({
    where: { toUserId, accepted: true },
    orderBy: { acceptedAt: "desc" },
    include: {
      fromUser: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({ accepted });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { toUserId, content, audioUrl } = testimonialSchema.parse(body);

    if (toUserId === user.id) {
      return NextResponse.json(
        { error: "Você não pode escrever depoimento para si." },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, username: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        fromUserId: user.id,
        toUserId,
        content: content.trim(),
        audioUrl: audioUrl ?? null,
        accepted: false,
      },
    });

    await createNotification(
      toUserId,
      "TESTIMONIAL_NEW",
      `${user.name} escreveu um depoimento para você.`,
      `/depoimentos`,
    );

    return NextResponse.json({ ok: true, id: testimonial.id });
  } catch {
    return NextResponse.json({ error: "Depoimento inválido." }, { status: 400 });
  }
}
