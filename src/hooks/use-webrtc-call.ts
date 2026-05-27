"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  requestUserMedia,
  vibrateIncomingCall,
} from "@/lib/media-devices";
import {
  detectActiveIcePath,
  type IcePathKind,
} from "@/lib/webrtc-ice-debug";
import { buildIceServers } from "@/lib/webrtc-ice";
import type { CallSignalPayload } from "./use-realtime-chat";

async function postSignal(body: Record<string, unknown>) {
  const res = await fetch("/api/calls/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json().then((data) => ({ ok: res.ok, status: res.status, data }));
}

function bindRemoteStream(
  pc: RTCPeerConnection,
  remoteEl: HTMLVideoElement | null,
) {
  if (!remoteEl) return;
  const tracks = pc
    .getReceivers()
    .map((r) => r.track)
    .filter((t): t is MediaStreamTrack => Boolean(t));
  if (tracks.length === 0) return;
  remoteEl.srcObject = new MediaStream(tracks);
  void remoteEl.play().catch(() => undefined);
}

export function useWebRTCCall(currentUserId: string) {
  const [overlay, setOverlay] = useState<{
    mode: "outgoing" | "incoming";
    peer: { id: string; name: string };
    callId: string;
  } | null>(null);
  const [status, setStatus] = useState("");
  const [icePath, setIcePath] = useState<IcePathKind>("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceMonitorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callIdRef = useRef<string | null>(null);
  const pendingOfferRef = useRef<string | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const callAcceptedRef = useRef(false);
  const overlayModeRef = useRef<"outgoing" | "incoming" | null>(null);

  const stopIceMonitor = useCallback(() => {
    if (iceMonitorRef.current) {
      clearInterval(iceMonitorRef.current);
      iceMonitorRef.current = null;
    }
    setIcePath("idle");
  }, []);

  const startIceMonitor = useCallback((pc: RTCPeerConnection) => {
    stopIceMonitor();
    const tick = async () => {
      if (pc.connectionState === "closed") return;
      setIcePath(await detectActiveIcePath(pc));
    };
    void tick();
    pc.addEventListener("iceconnectionstatechange", () => {
      void tick();
    });
    iceMonitorRef.current = setInterval(() => {
      void tick();
    }, 3000);
  }, [stopIceMonitor]);

  const cleanup = useCallback(() => {
    stopIceMonitor();
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    callIdRef.current = null;
    pendingOfferRef.current = null;
    callAcceptedRef.current = false;
    overlayModeRef.current = null;
  }, [stopIceMonitor]);

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
      if (remoteEl) remoteVideoRef.current = remoteEl;
      if (localStreamRef.current && localEl) {
        localEl.srcObject = localStreamRef.current;
        void localEl.play().catch(() => undefined);
      }
      const pc = pcRef.current;
      if (pc && remoteEl) {
        bindRemoteStream(pc, remoteEl);
      }
    },
    [],
  );

  const ensurePc = useCallback(async () => {
    if (pcRef.current) return pcRef.current;
    const stream =
      localStreamRef.current ??
      (await requestUserMedia({ audio: true, video: true }));
    localStreamRef.current = stream;
    const pc = new RTCPeerConnection(buildIceServers());
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = () => {
      setStatus("Conectado");
      bindRemoteStream(pc, remoteVideoRef.current);
    };
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
    startIceMonitor(pc);
    return pc;
  }, [startIceMonitor]);

  const answerPendingOffer = useCallback(async () => {
    const sdp = pendingOfferRef.current;
    if (!sdp || !callIdRef.current) return;
    const pc = await ensurePc();
    await pc.setRemoteDescription({ type: "offer", sdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await postSignal({
      callId: callIdRef.current,
      type: "answer",
      sdp: answer.sdp,
    });
    pendingOfferRef.current = null;
    setStatus("Conectado");
  }, [ensurePc]);

  const startCall = useCallback(
    async (peer: { id: string; name: string }) => {
      const { ok, status: httpStatus, data } = await postSignal({
        type: "invite",
        targetUserId: peer.id,
      });
      if (!ok) {
        const msg =
          httpStatus === 409
            ? "Chamada anterior ainda ativa — aguarde ou peça para desligar."
            : (data.error ?? "Falha ao iniciar chamada");
        setStatus(msg);
        return;
      }
      callIdRef.current = data.callId;
      overlayModeRef.current = "outgoing";
      setOverlay({ mode: "outgoing", peer, callId: data.callId });
      setStatus("Chamando…");
      try {
        const pc = await ensurePc();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await postSignal({ callId: data.callId, type: "offer", sdp: offer.sdp });
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Permita câmera e microfone para ligar.");
      }
    },
    [ensurePc],
  );

  const acceptCall = useCallback(async () => {
    if (!callIdRef.current) return;
    callAcceptedRef.current = true;
    setStatus("Conectando…");
    try {
      if (pendingOfferRef.current) {
        await answerPendingOffer();
      } else {
        await ensurePc();
        setStatus("Aguardando sinal do chamador…");
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Permita câmera e microfone para atender.");
    }
  }, [answerPendingOffer, ensurePc]);

  const handleSignal = useCallback(
    async (data: CallSignalPayload) => {
      if (data.fromUserId === currentUserId) return;

      if (data.type === "invite" && data.callId && data.fromUserId) {
        vibrateIncomingCall();
        setOverlay({
          mode: "incoming",
          peer: {
            id: data.fromUserId,
            name: data.fromUserName ?? "Amigo",
          },
          callId: data.callId,
        });
        callIdRef.current = data.callId;
        overlayModeRef.current = "incoming";
        callAcceptedRef.current = false;
        pendingOfferRef.current = null;
        setStatus("Chamada recebida — toque Atender");
        return;
      }

      if (!data.callId || data.callId !== callIdRef.current) return;

      if (data.type === "offer" && data.sdp) {
        if (overlayModeRef.current === "incoming" && !callAcceptedRef.current) {
          pendingOfferRef.current = data.sdp;
          setStatus("Chamada recebida — toque Atender");
          return;
        }
        try {
          const pc = await ensurePc();
          await pc.setRemoteDescription({ type: "offer", sdp: data.sdp });
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await postSignal({
            callId: data.callId,
            type: "answer",
            sdp: answer.sdp,
          });
          setStatus("Conectado");
        } catch (e) {
          setStatus(e instanceof Error ? e.message : "Erro ao processar chamada.");
        }
        return;
      }

      if (data.type === "answer" && data.sdp) {
        const pc = pcRef.current ?? (await ensurePc());
        await pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
        setStatus("Conectado");
        return;
      }

      if (data.type === "ice" && data.candidate) {
        const pc = pcRef.current;
        if (!pc) return;
        try {
          await pc.addIceCandidate(data.candidate);
        } catch {
          /* candidato duplicado */
        }
        return;
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
    icePath,
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
