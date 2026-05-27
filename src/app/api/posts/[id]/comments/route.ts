import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { moderateTextFull } from "@/lib/content-moderation";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { VISIBLE_AUTHOR_WHERE, VISIBLE_POST_WHERE } from "@/lib/visible-posts";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { commentSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId, author: VISIBLE_AUTHOR_WHERE },
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!(await checkRateLimit(key, 30, 60_000, "comments"))) {
    return NextResponse.json(
      { error: "Muitos comentários. Aguarde um momento." },
      { status: 429 },
    );
  }

  const { id: postId } = await params;
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      ...VISIBLE_POST_WHERE,
      author: VISIBLE_AUTHOR_WHERE,
    },
  });
  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { content, audioUrl } = commentSchema.parse(body);

    const text = content?.trim() ?? "";
    if (text) {
      const mod = await moderateTextFull(text);
      if (!mod.ok) {
        return NextResponse.json({ error: mod.reason }, { status: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content: text || "🎙️ Scrap por voz",
        audioUrl: audioUrl ?? null,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });

    if (post.authorId !== user.id) {
      await createNotification(
        post.authorId,
        "POST_COMMENT",
        `${user.name} comentou no seu recado`,
        `/feed?post=${postId}`,
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
