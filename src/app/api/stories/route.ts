import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { pushGlobalEvent } from "@/lib/pusher-server";

const storySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });

  const byUser = new Map<
    string,
    {
      user: (typeof stories)[0]["user"];
      items: typeof stories;
    }
  >();

  for (const s of stories) {
    const existing = byUser.get(s.userId);
    if (existing) existing.items.push(s);
    else byUser.set(s.userId, { user: s.user, items: [s] });
  }

  return NextResponse.json({
    groups: Array.from(byUser.values()).map((g) => ({
      user: g.user,
      stories: g.items.map((s) => ({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
      })),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = storySchema.parse(await request.json());
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        userId: user.id,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        expiresAt,
      },
    });

    const friends = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
    });

    for (const f of friends) {
      const friendId =
        f.requesterId === user.id ? f.addresseeId : f.requesterId;
      await createNotification(
        friendId,
        "STORY_NEW",
        `${user.name} postou um story!`,
        `/feed`,
      );
    }

    await pushGlobalEvent("story-new", {
      userId: user.id,
      username: user.username,
    });

    return NextResponse.json({ story });
  } catch {
    return NextResponse.json({ error: "Story inválido." }, { status: 400 });
  }
}
