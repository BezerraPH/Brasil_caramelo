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
import { useToast } from "./ToastProvider";

type Props = {
  casinha: CasinhaConfig;
};

type Speaker = {
  id: string;
  name: string;
  isLocal: boolean;
};

export function LatidosRoomClient({ casinha }: Props) {
  const toast = useToast();
  const roomRef = useRef<Room | null>(null);
  const audioEls = useRef<Map<string, HTMLAudioElement>>(new Map());

  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [disconnectHint, setDisconnectHint] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  const livekitConfigured = Boolean(process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim());

  const refreshSpeakers = useCallback((room: Room) => {
    const list: Speaker[] = [];
    const local = room.localParticipant;
    if (local) {
      list.push({
        id: local.identity,
        name: local.name || local.identity,
        isLocal: true,
      });
    }
    room.remoteParticipants.forEach((p: RemoteParticipant) => {
      list.push({
        id: p.identity,
        name: p.name || p.identity,
        isLocal: false,
      });
    });
    setSpeakers(list);
  }, []);

  const attachAudio = useCallback((track: RemoteTrack, participantId: string) => {
    if (track.kind !== Track.Kind.Audio) return;
    const el = track.attach();
    el.dataset.participant = participantId;
    audioEls.current.set(`${participantId}-${track.sid}`, el);
    document.body.appendChild(el);
  }, []);

  const detachAllAudio = useCallback(() => {
    audioEls.current.forEach((el) => {
      el.pause();
      el.remove();
    });
    audioEls.current.clear();
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
      });
      roomRef.current = room;

      room.on(RoomEvent.ParticipantConnected, () => refreshSpeakers(room));
      room.on(RoomEvent.ParticipantDisconnected, () => refreshSpeakers(room));
      room.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _pub: RemoteTrackPublication,
          participant: RemoteParticipant,
        ) => {
          attachAudio(track, participant.identity);
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

      await room.connect(data.url, data.token);
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
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
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
              <div className="bc-latidos-wave mb-4 flex justify-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="bc-latidos-bar"
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
                    <span>{s.isLocal ? "🎤" : "👂"}</span>
                    <span className="font-medium text-bc-blue">
                      {s.name}
                      {s.isLocal ? " (você)" : ""}
                    </span>
                  </li>
                ))}
                {speakers.length === 0 && (
                  <li className="text-center text-xs text-bc-brown">
                    Ninguém falando ainda — seja o primeiro a latir!
                  </li>
                )}
              </ul>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => void toggleMic()}
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
