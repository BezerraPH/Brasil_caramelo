import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  countUnreadMessages,
  getOrCreateConversation,
  otherParticipant,
} from "@/lib/chat";
import { prisma } from "@/lib/prisma";
import { startChatSchema } from "@/lib/validators";

const userSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
} as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantAId: user.id }, { participantBId: user.id }],
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
    include: {
      participantA: { select: userSelect },
      participantB: { select: userSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
  });

  const unreadTotal = await countUnreadMessages(user.id);

  const mapped = await Promise.all(
    conversations.map(async (c) => {
      const peerId = otherParticipant(c, user.id);
      const peer =
        c.participantAId === peerId ? c.participantA : c.participantB;
      const last = c.messages[0];
      const unread = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: user.id },
          readAt: null,
        },
      });
      return {
        id: c.id,
        peer,
        lastMessage: last
          ? {
              ...last,
              createdAt: last.createdAt.toISOString(),
              isMine: last.senderId === user.id,
            }
          : null,
        unread,
        lastMessageAt: c.lastMessageAt.toISOString(),
      };
    }),
  );

  return NextResponse.json({ conversations: mapped, unreadTotal });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { username } = startChatSchema.parse(await request.json());
    const peer = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: userSelect,
    });
    if (!peer) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const conversation = await getOrCreateConversation(user.id, peer.id);
    return NextResponse.json({
      conversation: {
        id: conversation.id,
        peer,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível iniciar o chat.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
