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
  LATIDOS_REACTIONS,
  decodeLatidosReaction,
  encodeLatidosReaction,
} from "@/lib/latidos-reactions";
import { getMatilhaLatidosTokenRoom } from "@/lib/matilha-latidos-shared";
import {
  canUseMediaDevices,
  mediaDevicesBlockedReason,
} from "@/lib/media-devices";
import { buildIceServers } from "@/lib/webrtc-ice";
import { useToast } from "./ToastProvider";

export type LatidosRoomIdentity =
  | { kind: "casinha"; casinha: CasinhaConfig }
  | { kind: "matilha"; slug: string; name: string; emoji?: string };

type Props = {
  room: LatidosRoomIdentity;
};

type FloatingReaction = {
  id: string;
  emoji: string;
  name: string;
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

function roomToken(room: LatidosRoomIdentity): string {
  return room.kind === "casinha"
    ? room.casinha.slug
    : getMatilhaLatidosTokenRoom(room.slug);
}

function roomTitle(room: LatidosRoomIdentity): {
  emoji: string;
  name: string;
  tagline: string;
  accent: string;
} {
  if (room.kind === "casinha") {
    return {
      emoji: room.casinha.emoji,
      name: room.casinha.name,
      tagline: room.casinha.tagline,
      accent: room.casinha.accent,
    };
  }
  return {
    emoji: room.emoji ?? "🐾",
    name: room.name,
    tagline: "Sala de áudio da Matilha",
    accent: "#C68642",
  };
}

export function LatidosRoomClient({ room }: Props) {
  const meta = roomTitle(room);
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
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

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
        `/api/livekit/token?room=${encodeURIComponent(roomToken(room))}`,
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

      const lkRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      roomRef.current = lkRoom;

      lkRoom.on(RoomEvent.ParticipantConnected, () => refreshSpeakers(lkRoom));
      lkRoom.on(RoomEvent.ParticipantDisconnected, () => refreshSpeakers(lkRoom));
      lkRoom.on(RoomEvent.LocalTrackPublished, () => refreshSpeakers(lkRoom));
      lkRoom.on(RoomEvent.LocalTrackUnpublished, () => refreshSpeakers(lkRoom));
      lkRoom.on(RoomEvent.TrackMuted, () => refreshSpeakers(lkRoom));
      lkRoom.on(RoomEvent.TrackUnmuted, () => refreshSpeakers(lkRoom));
      lkRoom.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _pub: RemoteTrackPublication,
          participant: RemoteParticipant,
        ) => {
          void attachAudio(track, participant.identity);
          refreshSpeakers(lkRoom);
        },
      );
      lkRoom.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el) => el.remove());
      });
      lkRoom.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        setStatus("error");
        setDisconnectHint(livekitDisconnectMessage(reason));
        setMicOn(false);
      });
      lkRoom.on(RoomEvent.DataReceived, (payload) => {
        const decoded = decodeLatidosReaction(payload);
        if (!decoded) return;
        const id = `${Date.now()}-${Math.random()}`;
        setReactions((prev) => [...prev.slice(-12), { id, ...decoded }]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 2800);
      });

      await lkRoom.connect(data.url, data.token, {
        rtcConfig: buildIceServers(),
      });
      await lkRoom.localParticipant.setMicrophoneEnabled(false);

      setStatus("connected");
      setMicOn(false);
      refreshSpeakers(lkRoom);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Falha ao conectar.");
      await disconnect();
    }
  }

  const sendReaction = useCallback(
    async (emoji: string, label: string) => {
      const lkRoom = roomRef.current;
      if (!lkRoom || status !== "connected") return;
      const name = lkRoom.localParticipant.name || "Caramelo";
      try {
        await lkRoom.localParticipant.publishData(
          encodeLatidosReaction({ type: "reaction", emoji, name }),
          { reliable: true },
        );
        const id = `local-${Date.now()}`;
        setReactions((prev) => [...prev.slice(-12), { id, emoji, name: `${name} · ${label}` }]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 2800);
      } catch {
        /* sala cheia */
      }
    },
    [status],
  );

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
        style={{ borderColor: `${meta.accent}33` }}
      >
        <p className="text-4xl">{meta.emoji}</p>
        <h1 className="bc-shimmer-text mt-2 text-2xl font-bold text-bc-blue">
          {meta.name}
        </h1>
        <p className="mt-1 text-sm text-bc-brown">{meta.tagline}</p>
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
                servidor. Veja CONFIGURACAO.md.
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

              <div className="bc-latidos-reactions mt-4">
                <p className="mb-2 text-center text-xs font-semibold text-bc-brown">
                  Reações rápidas
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {LATIDOS_REACTIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      title={r.label}
                      onClick={() => void sendReaction(r.emoji, r.label)}
                      className="bc-latidos-reaction-btn"
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bc-latidos-reaction-floats pointer-events-none relative mt-2 min-h-[2rem]">
                {reactions.map((r) => (
                  <span key={r.id} className="bc-latidos-reaction-pop">
                    {r.emoji}{" "}
                    <span className="text-[10px] font-medium">{r.name}</span>
                  </span>
                ))}
              </div>

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
        {room.kind === "casinha" ? (
          <>
            <Link
              href={`/casinha/${room.casinha.slug}`}
              className="text-bc-green hover:underline"
            >
              Ver casinha {room.casinha.emoji}
            </Link>
            {" · "}
            <Link href="/mensagens?tab=rooms" className="text-bc-green hover:underline">
              Chat da casinha
            </Link>
          </>
        ) : (
          <>
            <Link
              href={`/matilhas/${room.slug}`}
              className="text-bc-green hover:underline"
            >
              ← Voltar à Matilha
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
