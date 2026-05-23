import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAndUnlockAchievements, unlockAchievement } from "@/lib/achievements";
import type { AchievementKey } from "@/lib/achievement-defs";
import {
  attachSavedFlags,
  fetchFeedPage,
  parseFeedFilter,
} from "@/lib/feed-posts";
import { moderateText } from "@/lib/content-moderation";
import { notifyMentions } from "@/lib/notify-mentions";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { schedulePostVideoTranscode } from "@/lib/transcode-post-video";
import { postSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor");
  const mode = parseFeedFilter(params.get("filter"));

  const { posts, nextCursor } = await fetchFeedPage(user.id, cursor, {
    friendsOnly: mode === "friends",
    videosOnly: mode === "video",
  });
  const withSaved = await attachSavedFlags(user.id, posts);

  return NextResponse.json({ posts: withSaved, nextCursor });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 20, 60_000, "posts")) {
    return NextResponse.json(
      { error: "Muitos recados em pouco tempo. Aguarde um minuto." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { content, imageUrl, videoUrl, videoHlsUrl, communityLevel } =
      postSchema.parse(body);

    const text = content?.trim() ?? "";
    const mod = moderateText(text);
    if (!mod.ok) {
      return NextResponse.json({ error: mod.reason }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content: text,
        imageUrl: imageUrl ?? null,
        videoUrl: videoUrl ?? null,
        videoHlsUrl: videoHlsUrl ?? null,
        communityLevel: communityLevel ?? null,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (text) {
      await notifyMentions(text, user.id, user.name, post.id);
    }

    const newAchievements: AchievementKey[] = [];

    if (communityLevel) {
      if (await unlockAchievement(user.id, "CASINHA_FIRST")) {
        newAchievements.push("CASINHA_FIRST");
      }
    }
    void checkAndUnlockAchievements(user.id);

    const videoProcessing = Boolean(post.videoUrl && !post.videoHlsUrl);
    if (videoProcessing) {
      schedulePostVideoTranscode(post.id, post.videoUrl!);
      if (await unlockAchievement(user.id, "CINELAR_FIRST")) {
        newAchievements.push("CINELAR_FIRST");
      }
    }

    return NextResponse.json({
      post: { ...post, likedByMe: false, myReaction: null },
      newAchievements,
      videoProcessing,
    });
  } catch {
    return NextResponse.json({ error: "Recado inválido." }, { status: 400 });
  }
}
