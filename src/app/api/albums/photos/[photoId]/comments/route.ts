import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { moderateTextFull } from "@/lib/content-moderation";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { VISIBLE_AUTHOR_WHERE } from "@/lib/visible-posts";
import { photoCommentSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ photoId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { photoId } = await params;
  const comments = await prisma.photoComment.findMany({
    where: { photoId, author: VISIBLE_AUTHOR_WHERE },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 30, 60_000, "photo-comments")) {
    return NextResponse.json(
      { error: "Muitos comentários. Aguarde um momento." },
      { status: 429 },
    );
  }

  const { photoId } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: {
      album: {
        include: { user: { select: { id: true, shadowbanned: true } } },
      },
    },
  });

  if (!photo || photo.album.user.shadowbanned) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { content, audioUrl } = photoCommentSchema.parse(body);

    const text = content?.trim() ?? "";
    if (!text && !audioUrl) {
      return NextResponse.json(
        { error: "Escreva um comentário ou envie áudio." },
        { status: 400 },
      );
    }

    if (text) {
      const mod = await moderateTextFull(text);
      if (!mod.ok) {
        return NextResponse.json({ error: mod.reason }, { status: 400 });
      }
    }

    const comment = await prisma.photoComment.create({
      data: {
        photoId,
        authorId: user.id,
        content: text || "🎙️ Comentário por voz",
        audioUrl: audioUrl ?? null,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });

    const ownerId = photo.album.userId;
    if (ownerId !== user.id) {
      await createNotification(
        ownerId,
        "PHOTO_COMMENT",
        `${user.name} comentou na sua foto`,
        `/fotos/${photo.albumId}/${photoId}`,
      );
    }

    return NextResponse.json({
      comment: { ...comment, createdAt: comment.createdAt.toISOString() },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Comentário inválido." }, { status: 400 });
  }
}
