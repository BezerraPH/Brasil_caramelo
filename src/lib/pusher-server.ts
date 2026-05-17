import Pusher from "pusher";

let pusher: Pusher | null = null;

export function isPusherEnabled() {
  return Boolean(
    process.env.PUSHER_APP_ID &&
      process.env.PUSHER_KEY &&
      process.env.PUSHER_SECRET &&
      process.env.NEXT_PUBLIC_PUSHER_KEY &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  );
}

export function getPusherServer() {
  if (!isPusherEnabled()) return null;
  if (!pusher) {
    pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusher;
}

export function userChannelName(userId: string) {
  return `private-user-${userId}`;
}

import { GLOBAL_CHANNEL } from "./pusher-constants";

export { GLOBAL_CHANNEL };

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
