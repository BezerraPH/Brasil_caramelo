"use client";

import Pusher from "pusher-js";
import { useEffect, useRef } from "react";
import { chatChannelName, type TypingPayload } from "@/lib/chat-constants";
import { roomChannelName } from "@/lib/casinha-rooms-constants";

export type RealtimeMessagePayload = {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentMime?: string | null;
  senderId: string;
  senderName?: string;
  senderUsername?: string;
  createdAt: string;
};

export type CallSignalPayload = {
  type: string;
  callId?: string;
  sdp?: string;
  candidate?: RTCIceCandidateInit;
  fromUserId?: string;
  fromUserName?: string;
};

type UseRealtimeChatOptions = {
  userId: string;
  conversationId: string | null;
  roomId: string | null;
  pusherKey?: string | null;
  pusherCluster?: string | null;
  onDmMessage?: (msg: RealtimeMessagePayload) => void;
  onRoomMessage?: (msg: RealtimeMessagePayload) => void;
  onInboxUpdate?: () => void;
  onTyping?: (data: TypingPayload) => void;
  onCallSignal?: (data: CallSignalPayload) => void;
};

export function useRealtimeChat({
  userId,
  conversationId,
  roomId,
  pusherKey,
  pusherCluster,
  onDmMessage,
  onRoomMessage,
  onInboxUpdate,
  onTyping,
  onCallSignal,
}: UseRealtimeChatOptions) {
  const dmRef = useRef(onDmMessage);
  const roomRef = useRef(onRoomMessage);
  const inboxRef = useRef(onInboxUpdate);
  const typingRef = useRef(onTyping);
  const callRef = useRef(onCallSignal);

  useEffect(() => {
    dmRef.current = onDmMessage;
    roomRef.current = onRoomMessage;
    inboxRef.current = onInboxUpdate;
    typingRef.current = onTyping;
    callRef.current = onCallSignal;
  });

  useEffect(() => {
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/pusher/auth",
    });

    const userChannel = pusher.subscribe(`private-user-${userId}`);
    userChannel.bind("chat-inbox", () => inboxRef.current?.());
    userChannel.bind("call-signal", (data: CallSignalPayload) => {
      callRef.current?.(data);
    });

    let dmChannel: ReturnType<Pusher["subscribe"]> | null = null;
    if (conversationId) {
      dmChannel = pusher.subscribe(chatChannelName(conversationId));
      dmChannel.bind("message", (data: RealtimeMessagePayload) => {
        dmRef.current?.(data);
      });
      dmChannel.bind("typing", (data: TypingPayload) => {
        typingRef.current?.(data);
      });
    }

    let roomChannel: ReturnType<Pusher["subscribe"]> | null = null;
    if (roomId) {
      roomChannel = pusher.subscribe(roomChannelName(roomId));
      roomChannel.bind("message", (data: RealtimeMessagePayload) => {
        roomRef.current?.(data);
      });
      roomChannel.bind("typing", (data: TypingPayload) => {
        typingRef.current?.(data);
      });
    }

    return () => {
      userChannel.unbind_all();
      pusher.unsubscribe(`private-user-${userId}`);
      if (conversationId && dmChannel) {
        dmChannel.unbind_all();
        pusher.unsubscribe(chatChannelName(conversationId));
      }
      if (roomId && roomChannel) {
        roomChannel.unbind_all();
        pusher.unsubscribe(roomChannelName(roomId));
      }
      pusher.disconnect();
    };
  }, [userId, conversationId, roomId, pusherKey, pusherCluster]);
}
