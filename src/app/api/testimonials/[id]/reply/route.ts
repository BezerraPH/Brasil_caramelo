import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  parseTestimonialThread,
  serializeTestimonialThread,
  type TestimonialReply,
} from "@/lib/testimonials-thread";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { error: "O conteúdo da resposta não pode ser vazio." },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "A resposta não pode exceder 500 caracteres." },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: {
        fromUser: { select: { id: true, name: true, username: true } },
        toUser: { select: { id: true, name: true, username: true } },
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Depoimento não encontrado." },
        { status: 404 }
      );
    }

    // Apenas o dono do perfil (toUser) ou o autor original (fromUser) pode responder à thread
    if (user.id !== testimonial.toUserId && user.id !== testimonial.fromUserId) {
      return NextResponse.json(
        { error: "Apenas os participantes deste depoimento podem responder na thread." },
        { status: 403 }
      );
    }

    const { mainText, replies } = parseTestimonialThread(testimonial.content);

    const newReply: TestimonialReply = {
      id: crypto.randomUUID(),
      fromUserId: user.id,
      fromName: user.name,
      fromUsername: user.username,
      fromAvatarUrl: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedReplies = [...replies, newReply];
    const newContent = serializeTestimonialThread(mainText, updatedReplies);

    await prisma.testimonial.update({
      where: { id },
      data: { content: newContent },
    });

    // Notificar o outro participante
    const notifyTargetId =
      user.id === testimonial.toUserId
        ? testimonial.fromUserId
        : testimonial.toUserId;

    await createNotification(
      notifyTargetId,
      "TESTIMONIAL_NEW",
      `${user.name} respondeu ao recado no Scrapbook!`,
      `/perfil/${testimonial.toUser.username}`
    );

    return NextResponse.json({
      ok: true,
      reply: newReply,
      replies: updatedReplies,
    });
  } catch (error: unknown) {
    console.error("[TESTIMONIAL_REPLY_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao registrar resposta na thread." },
      { status: 500 }
    );
  }
}
