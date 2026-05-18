"use client";

import Pusher from "pusher-js";
import { useEffect, useRef } from "react";
import { chatChannelName } from "@/lib/chat-constants";

export type ChatMessagePayload = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
};

type UseChatPusherOptions = {
  userId: string;
  conversationId: string | null;
  pusherKey?: string | null;
  pusherCluster?: string | null;
  onMessage: (msg: ChatMessagePayload) => void;
  onInboxUpdate?: () => void;
};

export function useChatPusher({
  userId,
  conversationId,
  pusherKey,
  pusherCluster,
  onMessage,
  onInboxUpdate,
}: UseChatPusherOptions) {
  const onMessageRef = useRef(onMessage);
  const onInboxRef = useRef(onInboxUpdate);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onInboxRef.current = onInboxUpdate;
  });

  useEffect(() => {
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const userChannel = pusher.subscribe(`private-user-${userId}`);
    userChannel.bind("chat-inbox", () => {
      onInboxRef.current?.();
    });

    let chatChannel: ReturnType<Pusher["subscribe"]> | null = null;
    if (conversationId) {
      chatChannel = pusher.subscribe(chatChannelName(conversationId));
      chatChannel.bind("message", (data: ChatMessagePayload) => {
        onMessageRef.current(data);
      });
    }

    return () => {
      userChannel.unbind_all();
      pusher.unsubscribe(`private-user-${userId}`);
      if (conversationId && chatChannel) {
        chatChannel.unbind_all();
        pusher.unsubscribe(chatChannelName(conversationId));
      }
      pusher.disconnect();
    };
  }, [userId, conversationId, pusherKey, pusherCluster]);
}
