import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  MESSAGE_PAGE_SIZE,
  otherParticipant,
  userInConversation,
} from "@/lib/chat";
import { createNotification } from "@/lib/notifications";
import { pushChatMessage } from "@/lib/pusher-server";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { chatMessageSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: conversationId } = await context.params;
  if (!(await userInConversation(conversationId, user.id))) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  const cursor = new URL(request.url).searchParams.get("cursor");

  const rows = await prisma.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MESSAGE_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });

  const hasMore = rows.length > MESSAGE_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, MESSAGE_PAGE_SIZE) : rows;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  return NextResponse.json({
    messages: page.reverse().map((m) => ({
      id: m.id,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      attachmentMime: m.attachmentMime,
      senderId: m.senderId,
      sender: m.sender,
      readAt: m.readAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === user.id,
    })),
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
  if (!checkRateLimit(key, 40, 60_000, "chat")) {
    return NextResponse.json(
      { error: "Muitas mensagens. Aguarde um momento." },
      { status: 429 },
    );
  }

  const { id: conversationId } = await context.params;
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (
    !conversation ||
    !(await userInConversation(conversationId, user.id))
  ) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  try {
    const parsed = chatMessageSchema.parse(await request.json());
    const trimmed = parsed.content?.trim() ?? "";

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: trimmed,
        attachmentUrl: parsed.attachmentUrl ?? null,
        attachmentMime: parsed.attachmentMime ?? null,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: message.createdAt },
    });

    const recipientId = otherParticipant(conversation, user.id);
    const payload = {
      id: message.id,
      content: message.content,
      attachmentUrl: message.attachmentUrl,
      attachmentMime: message.attachmentMime,
      senderId: message.senderId,
      senderName: user.name,
      createdAt: message.createdAt.toISOString(),
    };

    await pushChatMessage(recipientId, conversationId, payload);

    await createNotification(
      recipientId,
      "CHAT_MESSAGE",
      `${user.name} enviou uma mensagem`,
      `/mensagens?c=${conversationId}`,
    );

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        attachmentUrl: message.attachmentUrl,
        attachmentMime: message.attachmentMime,
        senderId: message.senderId,
        sender: message.sender,
        readAt: null,
        createdAt: message.createdAt.toISOString(),
        isMine: true,
      },
    });
  } catch {
    return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  }
}
