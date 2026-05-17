import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
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
    where: { postId },
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

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { content } = commentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: { postId, authorId: user.id, content },
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
