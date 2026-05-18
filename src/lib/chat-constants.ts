export const CHAT_CHANNEL_PREFIX = "private-chat-";
export const MESSAGE_PAGE_SIZE = 40;

export function chatChannelName(conversationId: string) {
  return `${CHAT_CHANNEL_PREFIX}${conversationId}`;
}

/** Ordem canônica para par único na tabela. */
export function orderParticipants(
  id1: string,
  id2: string,
): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

export function otherParticipant(
  conversation: { participantAId: string; participantBId: string },
  userId: string,
): string {
  return conversation.participantAId === userId
    ? conversation.participantBId
    : conversation.participantAId;
}

export type TypingPayload = {
  userId: string;
  userName: string;
  isTyping: boolean;
};
