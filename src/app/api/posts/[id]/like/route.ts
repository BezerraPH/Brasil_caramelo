import { NextResponse } from "next/server";
import type { ReactionType } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { reactionEmoji } from "@/lib/reactions";
import { z } from "zod";

const bodySchema = z.object({
  reaction: z.enum(["HEART", "AUAU", "GROWL", "WHINE"]).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: postId } = await params;
  let reaction: ReactionType = "HEART";
  const raw = await request.text();
  if (raw.trim()) {
    try {
      reaction = bodySchema.parse(JSON.parse(raw)).reaction ?? "HEART";
    } catch {
      return NextResponse.json({ error: "Reação inválida." }, { status: 400 });
    }
  }

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
    if (existing.reaction === reaction) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { postId } });
      return NextResponse.json({
        reacted: false,
        reaction: null,
        likeCount: count,
      });
    }
    await prisma.like.update({
      where: { id: existing.id },
      data: { reaction },
    });
    if (post.authorId !== user.id) {
      await createNotification(
        post.authorId,
        "POST_REACTION",
        `${user.name} reagiu ${reactionEmoji(reaction)} ao seu recado`,
        `/feed?post=${postId}`,
      );
    }
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({
      reacted: true,
      reaction,
      likeCount: count,
    });
  }

  await prisma.like.create({
    data: { postId, userId: user.id, reaction },
  });

  if (post.authorId !== user.id) {
    const type = reaction === "HEART" ? "POST_LIKE" : "POST_REACTION";
    const msg =
      reaction === "HEART"
        ? `${user.name} curtiu seu recado`
        : `${user.name} reagiu ${reactionEmoji(reaction)} ao seu recado`;
    await createNotification(post.authorId, type, msg, `/feed?post=${postId}`);
  }

  const count = await prisma.like.count({ where: { postId } });
  return NextResponse.json({
    reacted: true,
    reaction,
    likeCount: count,
  });
}
