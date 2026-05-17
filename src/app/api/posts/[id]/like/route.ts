import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { postId, userId: user.id } });

  if (post.authorId !== user.id) {
    await createNotification(
      post.authorId,
      "POST_LIKE",
      `${user.name} curtiu seu recado`,
      `/feed?post=${postId}`,
    );
  }

  return NextResponse.json({ liked: true });
}
