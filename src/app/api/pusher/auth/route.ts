import { NextResponse } from "next/server";
import { CHAT_CHANNEL_PREFIX } from "@/lib/chat-constants";
import { ROOM_CHANNEL_PREFIX } from "@/lib/casinha-rooms-constants";
import { userInConversation } from "@/lib/chat";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getPusherServer,
  isPusherEnabled,
  userChannelName,
} from "@/lib/pusher-server";

export async function POST(request: Request) {
  if (!isPusherEnabled()) {
    return NextResponse.json({ error: "Pusher não configurado." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.formData();
  const socketId = body.get("socket_id") as string;
  const channel = body.get("channel_name") as string;

  const pusher = getPusherServer();
  if (!pusher) {
    return NextResponse.json({ error: "Pusher indisponível." }, { status: 503 });
  }

  if (channel === userChannelName(user.id)) {
    const auth = pusher.authorizeChannel(socketId, channel);
    return NextResponse.json(auth);
  }

  if (channel.startsWith(CHAT_CHANNEL_PREFIX)) {
    const conversationId = channel.slice(CHAT_CHANNEL_PREFIX.length);
    const allowed = await userInConversation(conversationId, user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Canal inválido." }, { status: 403 });
    }
    const auth = pusher.authorizeChannel(socketId, channel);
    return NextResponse.json(auth);
  }

  if (channel.startsWith(ROOM_CHANNEL_PREFIX)) {
    const roomId = channel.slice(ROOM_CHANNEL_PREFIX.length);
    const room = await prisma.casinhaRoom.findUnique({
      where: { id: roomId },
      select: { id: true },
    });
    if (!room) {
      return NextResponse.json({ error: "Canal inválido." }, { status: 403 });
    }
    const auth = pusher.authorizeChannel(socketId, channel);
    return NextResponse.json(auth);
  }

  return NextResponse.json({ error: "Canal inválido." }, { status: 403 });
}
