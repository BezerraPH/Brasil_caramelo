import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/casinha-rooms";
import { roomChannelName } from "@/lib/casinha-rooms-constants";
import { pushTyping } from "@/lib/pusher-server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!(await checkRateLimit(key, 30, 10_000, "typing"))) {
    return NextResponse.json({ ok: true });
  }

  const { slug } = await context.params;
  const room = await getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const isTyping = Boolean(body.isTyping);

  await pushTyping(roomChannelName(room.id), {
    userId: user.id,
    userName: user.name,
    isTyping,
  });

  return NextResponse.json({ ok: true });
}
