import Pusher from "pusher";
import { chatChannelName, type TypingPayload } from "./chat-constants";
import { roomChannelName } from "./casinha-rooms-constants";
import { GLOBAL_CHANNEL } from "./pusher-constants";

export { GLOBAL_CHANNEL, chatChannelName, roomChannelName };

let pusher: Pusher | null = null;

export function isPusherEnabled() {
  const base =
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.NEXT_PUBLIC_PUSHER_KEY;

  if (!base) return false;

  return Boolean(
    process.env.NEXT_PUBLIC_PUSHER_HOST?.trim() ||
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim(),
  );
}

function buildServerOptions(): ConstructorParameters<typeof Pusher>[0] {
  const host = process.env.PUSHER_HOST?.trim();
  if (host) {
    return {
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      host,
      port: String(process.env.PUSHER_PORT || "6001"),
      useTLS: process.env.PUSHER_USE_TLS === "true",
    };
  }
  return {
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
  };
}

export function getPusherServer() {
  if (!isPusherEnabled()) return null;
  if (!pusher) {
    pusher = new Pusher(buildServerOptions());
  }
  return pusher;
}

export function userChannelName(userId: string) {
  return `private-user-${userId}`;
}

export async function pushChatMessage(
  recipientUserId: string,
  conversationId: string,
  payload: {
    id: string;
    content: string;
    attachmentUrl?: string | null;
    attachmentMime?: string | null;
    senderId: string;
    senderName: string;
    createdAt: string;
  },
) {
  const server = getPusherServer();
  if (!server) return;

  const preview =
    payload.content.trim() ||
    (payload.attachmentUrl ? "📎 Anexo" : "Nova mensagem");

  await Promise.all([
    server.trigger(chatChannelName(conversationId), "message", payload),
    server.trigger(userChannelName(recipientUserId), "chat-inbox", {
      conversationId,
      preview: preview.slice(0, 80),
      senderName: payload.senderName,
    }),
  ]);
}

export async function pushRoomMessage(
  roomId: string,
  payload: {
    id: string;
    content: string;
    attachmentUrl?: string | null;
    attachmentMime?: string | null;
    senderId: string;
    senderName: string;
    senderUsername: string;
    createdAt: string;
  },
) {
  const server = getPusherServer();
  if (!server) return;
  await server.trigger(roomChannelName(roomId), "message", payload);
}

export async function pushTyping(
  channel: string,
  data: TypingPayload,
) {
  const server = getPusherServer();
  if (!server) return;
  await server.trigger(channel, "typing", data);
}

export async function pushCallSignal(
  targetUserId: string,
  payload: Record<string, unknown>,
) {
  const server = getPusherServer();
  if (!server) return;
  await server.trigger(userChannelName(targetUserId), "call-signal", payload);
}

export async function pushNotificationEvent(
  userId: string,
  payload: {
    id: string;
    message: string;
    link: string | null;
    type: string;
    createdAt: string;
  },
) {
  const server = getPusherServer();
  if (!server) return;

  await server.trigger(userChannelName(userId), "notification", payload);
}

export async function pushGlobalEvent(event: string, payload: unknown) {
  const server = getPusherServer();
  if (!server) return;
  await server.trigger(GLOBAL_CHANNEL, event, payload as Record<string, unknown>);
}
