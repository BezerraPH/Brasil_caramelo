"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  type DisconnectReason,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
import type { CasinhaConfig } from "@/lib/casinhas";
import { formatAchievementToast, type AchievementKey } from "@/lib/achievement-defs";
import { livekitDisconnectMessage } from "@/lib/livekit-errors";
import {
  canUseMediaDevices,
  mediaDevicesBlockedReason,
} from "@/lib/media-devices";
import { buildIceServers } from "@/lib/webrtc-ice";
import { useToast } from "./ToastProvider";

type Props = {
  casinha: CasinhaConfig;
};

type Speaker = {
  id: string;
  name: string;
  isLocal: boolean;
  micLive: boolean;
};

async function playAudioElement(el: HTMLAudioElement) {
  el.setAttribute("playsinline", "true");
  el.autoplay = true;
  el.volume = 1;
  try {
    await el.play();
    return true;
  } catch {
    return false;
  }
}

export function LatidosRoomClient({ casinha }: Props) {
  const toast = useToast();
  const roomRef = useRef<Room | null>(null);
  const audioEls = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioSinkRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [disconnectHint, setDisconnectHint] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [needsAudioTap, setNeedsAudioTap] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  const livekitConfigured = Boolean(process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim());
  const mediaBlocked = mediaDevicesBlockedReason();

  const refreshSpeakers = useCallback((room: Room) => {
    const list: Speaker[] = [];
    const local = room.localParticipant;
    if (local) {
      const micPub = local.getTrackPublication(Track.Source.Microphone);
      list.push({
        id: local.identity,
        name: local.name || local.identity,
        isLocal: true,
        micLive: Boolean(micPub && !micPub.isMuted && micPub.track),
      });
    }
    room.remoteParticipants.forEach((p: RemoteParticipant) => {
      const micPub = p.getTrackPublication(Track.Source.Microphone);
      list.push({
        id: p.identity,
        name: p.name || p.identity,
        isLocal: false,
        micLive: Boolean(micPub && !micPub.isMuted && micPub.track),
      });
    });
    setSpeakers(list);
  }, []);

  const attachAudio = useCallback(
    async (track: RemoteTrack, participantId: string) => {
      if (track.kind !== Track.Kind.Audio) return;
      const key = `${participantId}-${track.sid}`;
      if (audioEls.current.has(key)) return;

      const el = track.attach() as HTMLAudioElement;
      el.dataset.participant = participantId;
      el.className = "bc-latidos-remote-audio";
      audioEls.current.set(key, el);

      const sink = audioSinkRef.current;
      if (sink) sink.appendChild(el);
      else document.body.appendChild(el);

      const played = await playAudioElement(el);
      if (!played) setNeedsAudioTap(true);
    },
    [],
  );

  const detachAllAudio = useCallback(() => {
    audioEls.current.forEach((el) => {
      el.pause();
      el.remove();
    });
    audioEls.current.clear();
  }, []);

  const unlockAudio = useCallback(async () => {
    let ok = true;
    for (const el of audioEls.current.values()) {
      const played = await playAudioElement(el);
      if (!played) ok = false;
    }
    setNeedsAudioTap(!ok);
  }, []);

  const disconnect = useCallback(async () => {
    detachAllAudio();
    const room = roomRef.current;
    roomRef.current = null;
    if (room) {
      await room.disconnect();
    }
    setStatus("idle");
    setMicOn(false);
    setMicError(null);
    setSpeakers([]);
  }, [detachAllAudio]);

  useEffect(() => {
    return () => {
      void disconnect();
    };
  }, [disconnect]);

  async function join() {
    if (!livekitConfigured) {
      setError("LiveKit não configurado no servidor.");
      return;
    }

    setStatus("connecting");
    setError(null);
    setDisconnectHint(null);
    setMicError(null);

    try {
      const res = await fetch(
        `/api/livekit/token?room=${encodeURIComponent(casinha.slug)}`,
      );
      const data = (await res.json()) as {
        token?: string;
        url?: string;
        error?: string;
        newAchievement?: AchievementKey | null;
      };

      if (!res.ok || !data.token || !data.url) {
        throw new Error(data.error ?? "Não foi possível entrar na sala.");
      }

      if (data.newAchievement) {
        toast(formatAchievementToast(data.newAchievement), "achievement");
      }

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      roomRef.current = room;

      room.on(RoomEvent.ParticipantConnected, () => refreshSpeakers(room));
      room.on(RoomEvent.ParticipantDisconnected, () => refreshSpeakers(room));
      room.on(RoomEvent.LocalTrackPublished, () => refreshSpeakers(room));
      room.on(RoomEvent.LocalTrackUnpublished, () => refreshSpeakers(room));
      room.on(RoomEvent.TrackMuted, () => refreshSpeakers(room));
      room.on(RoomEvent.TrackUnmuted, () => refreshSpeakers(room));
      room.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _pub: RemoteTrackPublication,
          participant: RemoteParticipant,
        ) => {
          void attachAudio(track, participant.identity);
          refreshSpeakers(room);
        },
      );
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el) => el.remove());
      });
      room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        setStatus("error");
        setDisconnectHint(livekitDisconnectMessage(reason));
        setMicOn(false);
      });

      await room.connect(data.url, data.token, {
        rtcConfig: buildIceServers(),
      });
      await room.localParticipant.setMicrophoneEnabled(false);

      setStatus("connected");
      setMicOn(false);
      refreshSpeakers(room);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Falha ao conectar.");
      await disconnect();
    }
  }

  async function toggleMic() {
    const room = roomRef.current;
    if (!room || status !== "connected") return;

    const next = !micOn;
    setMicError(null);

    if (next && !canUseMediaDevices()) {
      setMicError(mediaBlocked ?? "Microfone indisponível neste navegador.");
      return;
    }

    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
      refreshSpeakers(room);
    } catch (e) {
      setMicError(
        e instanceof Error
          ? e.message
          : "Não foi possível usar o microfone. Verifique permissões.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <section
        className="bc-card bc-latidos-header bc-animate-in p-6 text-center"
        style={{ borderColor: `${casinha.accent}33` }}
      >
        <p className="text-4xl">{casinha.emoji}</p>
        <h1 className="bc-shimmer-text mt-2 text-2xl font-bold text-bc-blue">
          {casinha.name}
        </h1>
        <p className="mt-1 text-sm text-bc-brown">{casinha.tagline}</p>
        <p className="mt-2 text-xs text-bc-brown/80">
          Sala de áudio ao vivo — latidos e papo da matilha
        </p>
      </section>

      {mediaBlocked && status !== "connected" && (
        <div className="bc-card border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-950">
          <p className="font-medium">📱 Celular em HTTP</p>
          <p className="mt-1 text-xs">{mediaBlocked}</p>
        </div>
      )}

      <div ref={audioSinkRef} className="sr-only" aria-hidden />

      {status === "idle" && (
        <div className="bc-latidos-room bc-card bc-animate-in-up p-6 text-center">
          {!livekitConfigured ? (
            <>
              <p className="text-sm text-bc-brown">
                Configure{" "}
                <code className="text-[10px]">NEXT_PUBLIC_LIVEKIT_URL</code> no
                servidor. Veja LIVEKIT.md.
              </p>
              <Link href="/latidos" className="bc-btn-secondary mt-4 inline-block">
                ← Voltar
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-bc-brown">
                Entre para ouvir e falar com a matilha. Microfone começa mudo.
              </p>
              <button
                type="button"
                onClick={() => void join()}
                className="bc-btn-primary bc-latidos-join-btn mt-4"
              >
                🎙️ Entrar na sala
              </button>
              <Link
                href="/latidos"
                className="mt-3 block text-xs text-bc-green hover:underline"
              >
                ← Todas as salas
              </Link>
            </>
          )}
        </div>
      )}

      {status === "connecting" && (
        <div className="bc-card bc-animate-pulse p-8 text-center text-bc-brown">
          Conectando à toca…
        </div>
      )}

      {(status === "connected" || status === "error") && (
        <section className="bc-card bc-latidos-live bc-animate-in p-5">
          {status === "error" && (error || disconnectHint) && (
            <div className="bc-latidos-error mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-900 bc-animate-in">
              <p>{error ?? disconnectHint}</p>
              <button
                type="button"
                onClick={() => void join()}
                className="bc-btn-secondary mt-3 text-xs"
              >
                🔄 Tentar de novo
              </button>
              <Link
                href="/latidos"
                className="mt-2 block text-xs text-bc-green hover:underline"
              >
                ← Voltar às salas
              </Link>
            </div>
          )}

          {status === "connected" && (
            <>
              {needsAudioTap && (
                <button
                  type="button"
                  onClick={() => void unlockAudio()}
                  className="bc-btn-primary mb-4 w-full text-sm"
                >
                  🔊 Tocar áudio da sala
                </button>
              )}

              <div className="bc-latidos-wave mb-4 flex justify-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`bc-latidos-bar ${micOn ? "bc-latidos-bar--hot" : ""}`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>

              <p className="text-center text-sm font-medium text-bc-green">
                🟢 Ao vivo · {speakers.length} na sala
              </p>

              <ul className="mt-4 space-y-2">
                {speakers.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 rounded-lg bg-bc-blue/5 px-3 py-2 text-sm"
                  >
                    <span>{s.micLive ? "🎤" : s.isLocal ? "🔇" : "👂"}</span>
                    <span className="font-medium text-bc-blue">
                      {s.name}
                      {s.isLocal ? " (você)" : ""}
                      {s.micLive ? " · falando" : ""}
                    </span>
                  </li>
                ))}
                {speakers.length === 0 && (
                  <li className="text-center text-xs text-bc-brown">
                    Ninguém falando ainda — seja o primeiro a latir!
                  </li>
                )}
              </ul>

              {micError && (
                <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-800">
                  {micError}
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => void toggleMic()}
                  disabled={Boolean(mediaBlocked)}
                  className={micOn ? "bc-btn-primary" : "bc-btn-secondary"}
                >
                  {micOn ? "🔇 Mutar" : "🎙️ Ativar microfone"}
                </button>
                <button
                  type="button"
                  onClick={() => void disconnect()}
                  className="bc-btn-ghost text-red-700"
                >
                  Sair da sala
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <p className="text-center text-xs text-bc-brown/70">
        <Link href={`/casinha/${casinha.slug}`} className="text-bc-green hover:underline">
          Ver casinha {casinha.emoji}
        </Link>
        {" · "}
        <Link href="/mensagens?tab=rooms" className="text-bc-green hover:underline">
          Chat da casinha
        </Link>
      </p>
    </div>
  );
}
