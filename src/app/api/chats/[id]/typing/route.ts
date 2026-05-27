import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { chatChannelName } from "@/lib/chat-constants";
import { userInConversation } from "@/lib/chat";
import { pushTyping } from "@/lib/pusher-server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

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

  const { id: conversationId } = await context.params;
  if (!(await userInConversation(conversationId, user.id))) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const isTyping = Boolean(body.isTyping);

  await pushTyping(chatChannelName(conversationId), {
    userId: user.id,
    userName: user.name,
    isTyping,
  });

  return NextResponse.json({ ok: true });
}
