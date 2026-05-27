"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useWebRTCCall } from "@/hooks/use-webrtc-call";
import type { CallSignalPayload } from "@/hooks/use-realtime-chat";
import {
  createPusherClient,
  isPusherClientConfigured,
} from "@/lib/pusher-client";
import { WebRTCCallOverlay } from "./WebRTCCallOverlay";

type CallContextValue = ReturnType<typeof useWebRTCCall>;

const CallContext = createContext<CallContextValue | null>(null);

type Props = {
  userId: string;
  pusherKey?: string | null;
  pusherCluster?: string | null;
  children: ReactNode;
};

export function CallProvider({
  userId,
  pusherKey,
  pusherCluster,
  children,
}: Props) {
  const call = useWebRTCCall(userId);
  const handleSignalRef = useRef(call.handleSignal);

  useEffect(() => {
    handleSignalRef.current = call.handleSignal;
  });

  useEffect(() => {
    if (!isPusherClientConfigured(pusherKey, pusherCluster)) return;

    const pusher = createPusherClient(pusherKey!, pusherCluster ?? "");
    if (!pusher) return;

    const channel = pusher.subscribe(`private-user-${userId}`);
    channel.bind("call-signal", (data: CallSignalPayload) => {
      void handleSignalRef.current(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-user-${userId}`);
      pusher.disconnect();
    };
  }, [userId, pusherKey, pusherCluster]);

  return (
    <CallContext.Provider value={call}>
      {children}
      {call.overlay && (
        <WebRTCCallOverlay
          mode={call.overlay.mode}
          peerName={call.overlay.peer.name}
          status={call.status}
          icePath={call.icePath}
          onHangup={() => void call.hangup()}
          onAccept={() => void call.acceptCall()}
          onDecline={() => void call.decline()}
          attachStream={call.attachStream}
        />
      )}
    </CallContext.Provider>
  );
}

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall deve ser usado dentro de CallProvider");
  }
  return ctx;
}

export function useCallOptional(): CallContextValue | null {
  return useContext(CallContext);
}
