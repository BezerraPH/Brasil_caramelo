import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/casinha-rooms";
import { MESSAGE_PAGE_SIZE } from "@/lib/chat-constants";
import { moderateTextFull } from "@/lib/content-moderation";
import { pushRoomMessage } from "@/lib/pusher-server";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { chatMessageSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ slug: string }> };

const senderSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
} as const;

function mapMessage(
  m: {
    id: string;
    content: string;
    attachmentUrl: string | null;
    attachmentMime: string | null;
    senderId: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string;
      username: string;
      avatarUrl: string | null;
    };
  },
  userId: string,
) {
  return {
    id: m.id,
    content: m.content,
    attachmentUrl: m.attachmentUrl,
    attachmentMime: m.attachmentMime,
    senderId: m.senderId,
    sender: m.sender,
    createdAt: m.createdAt.toISOString(),
    isMine: m.senderId === userId,
  };
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const room = await getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }

  const cursor = new URL(request.url).searchParams.get("cursor");
  const rows = await prisma.casinhaRoomMessage.findMany({
    where: { roomId: room.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MESSAGE_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { sender: { select: senderSelect } },
  });

  const hasMore = rows.length > MESSAGE_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, MESSAGE_PAGE_SIZE) : rows;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  return NextResponse.json({
    room: {
      id: room.id,
      slug: room.slug,
      name: room.name,
      emoji: room.emoji,
    },
    messages: page.reverse().map((m) => mapMessage(m, user.id)),
    nextCursor,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 40, 60_000, "room-chat")) {
    return NextResponse.json(
      { error: "Muitas mensagens. Aguarde um momento." },
      { status: 429 },
    );
  }

  const { slug } = await context.params;
  const room = await getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }

  if (user.shadowbanned) {
    return NextResponse.json(
      { error: "Sua conta está restrita." },
      { status: 403 },
    );
  }

  try {
    const body = chatMessageSchema.parse(await request.json());
    const trimmed = body.content?.trim() ?? "";
    if (trimmed) {
      const mod = await moderateTextFull(trimmed);
      if (!mod.ok) {
        return NextResponse.json({ error: mod.reason }, { status: 400 });
      }
    }

    const message = await prisma.casinhaRoomMessage.create({
      data: {
        roomId: room.id,
        senderId: user.id,
        content: trimmed,
        attachmentUrl: body.attachmentUrl ?? null,
        attachmentMime: body.attachmentMime ?? null,
      },
      include: { sender: { select: senderSelect } },
    });

    await prisma.casinhaRoom.update({
      where: { id: room.id },
      data: { lastMessageAt: message.createdAt },
    });

    const payload = {
      id: message.id,
      content: message.content,
      attachmentUrl: message.attachmentUrl,
      attachmentMime: message.attachmentMime,
      senderId: message.senderId,
      senderName: user.name,
      senderUsername: user.username,
      createdAt: message.createdAt.toISOString(),
    };

    await pushRoomMessage(room.id, payload);

    return NextResponse.json({ message: mapMessage(message, user.id) });
  } catch {
    return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  }
}
