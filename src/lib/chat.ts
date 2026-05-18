import { orderParticipants } from "./chat-constants";
import { prisma } from "./prisma";
import { areFriends } from "./friendship";

export {
  CHAT_CHANNEL_PREFIX,
  MESSAGE_PAGE_SIZE,
  chatChannelName,
  orderParticipants,
  otherParticipant,
} from "./chat-constants";

export async function userInConversation(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participantAId: true, participantBId: true },
  });
  if (!c) return false;
  return c.participantAId === userId || c.participantBId === userId;
}

export async function getOrCreateConversation(
  userId: string,
  otherUserId: string,
) {
  if (userId === otherUserId) {
    throw new Error("Não é possível conversar consigo mesmo.");
  }

  const friends = await areFriends(userId, otherUserId);
  if (!friends) {
    throw new Error("Só é possível conversar com amigos aceitos.");
  }

  const [participantAId, participantBId] = orderParticipants(
    userId,
    otherUserId,
  );

  const existing = await prisma.conversation.findUnique({
    where: {
      participantAId_participantBId: { participantAId, participantBId },
    },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { participantAId, participantBId },
  });
}

export async function countUnreadMessages(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
    },
  });
}
