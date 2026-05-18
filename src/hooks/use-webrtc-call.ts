"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CallSignalPayload } from "./use-realtime-chat";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

async function postSignal(body: Record<string, unknown>) {
  const res = await fetch("/api/calls/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json().then((data) => ({ ok: res.ok, data }));
}

export function useWebRTCCall(currentUserId: string) {
  const [overlay, setOverlay] = useState<{
    mode: "outgoing" | "incoming";
    peer: { id: string; name: string };
    callId: string;
  } | null>(null);
  const [status, setStatus] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callIdRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    callIdRef.current = null;
  }, []);

  const close = useCallback(() => {
    cleanup();
    setOverlay(null);
    setStatus("");
  }, [cleanup]);

  const hangup = useCallback(async () => {
    if (callIdRef.current) {
      await postSignal({ callId: callIdRef.current, type: "hangup" });
    }
    close();
  }, [close]);

  const attachStream = useCallback(
    async (localEl: HTMLVideoElement | null, remoteEl: HTMLVideoElement | null) => {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        localStreamRef.current = stream;
      }
      if (localEl) {
        localEl.srcObject = localStreamRef.current;
      }
      const pc = pcRef.current;
      if (pc && remoteEl) {
        const receivers = pc.getReceivers();
        if (receivers[0]?.track) {
          remoteEl.srcObject = new MediaStream([receivers[0].track]);
        }
      }
    },
    [],
  );

  const ensurePc = useCallback(async () => {
    if (pcRef.current) return pcRef.current;
    const stream = localStreamRef.current ??
      (await navigator.mediaDevices.getUserMedia({ audio: true, video: true }));
    localStreamRef.current = stream;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = () => setStatus("Conectado");
    pc.onicecandidate = (ev) => {
      if (ev.candidate && callIdRef.current) {
        void postSignal({
          callId: callIdRef.current,
          type: "ice",
          candidate: ev.candidate.toJSON(),
        });
      }
    };
    pcRef.current = pc;
    return pc;
  }, []);

  const startCall = useCallback(
    async (peer: { id: string; name: string }) => {
      const { ok, data } = await postSignal({
        type: "invite",
        targetUserId: peer.id,
      });
      if (!ok) {
        setStatus(data.error ?? "Falha");
        return;
      }
      callIdRef.current = data.callId;
      setOverlay({ mode: "outgoing", peer, callId: data.callId });
      setStatus("Chamando…");
      const pc = await ensurePc();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await postSignal({ callId: data.callId, type: "offer", sdp: offer.sdp });
    },
    [ensurePc],
  );

  const acceptCall = useCallback(async () => {
    if (!callIdRef.current) return;
    setStatus("Conectando…");
    await ensurePc();
  }, [ensurePc]);

  const handleSignal = useCallback(
    async (data: CallSignalPayload) => {
      if (data.fromUserId === currentUserId) return;

      if (data.type === "invite" && data.callId && data.fromUserId) {
        setOverlay({
          mode: "incoming",
          peer: {
            id: data.fromUserId,
            name: data.fromUserName ?? "Amigo",
          },
          callId: data.callId,
        });
        callIdRef.current = data.callId;
        setStatus("Chamada recebida");
        return;
      }

      if (!data.callId || data.callId !== callIdRef.current) return;

      const pc = await ensurePc();

      if (data.type === "offer" && data.sdp) {
        await pc.setRemoteDescription({ type: "offer", sdp: data.sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal({
          callId: data.callId,
          type: "answer",
          sdp: answer.sdp,
        });
        setStatus("Conectado");
      }

      if (data.type === "answer" && data.sdp) {
        await pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
        setStatus("Conectado");
      }

      if (data.type === "ice" && data.candidate) {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch {
          /* candidato duplicado */
        }
      }

      if (data.type === "hangup" || data.type === "decline") {
        setStatus("Encerrada");
        close();
      }
    },
    [close, currentUserId, ensurePc],
  );

  const decline = useCallback(async () => {
    if (callIdRef.current) {
      await postSignal({ callId: callIdRef.current, type: "decline" });
    }
    close();
  }, [close]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    overlay,
    status,
    startCall,
    acceptCall,
    decline,
    hangup,
    close,
    handleSignal,
    attachStream,
    localStreamRef,
  };
}
