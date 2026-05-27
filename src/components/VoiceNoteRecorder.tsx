"use client";

import { useCallback, useRef, useState } from "react";
import { UivoPlayer } from "@/components/UivoPlayer";

type VoiceNoteRecorderProps = {
  onRecorded: (url: string) => void;
  onClear: () => void;
  audioUrl: string | null;
  maxSeconds?: number;
};

export function VoiceNoteRecorder({
  onRecorded,
  onClear,
  audioUrl,
  maxSeconds = 10,
}: VoiceNoteRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    mediaRef.current?.stop();
    setRecording(false);
  }, []);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 100) return;
        const form = new FormData();
        form.append("file", blob, "voice.webm");
        form.append("kind", "voiceNote");
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (res.ok && data.url) {
          onRecorded(data.url);
        } else {
          setError(data.error ?? "Falha ao enviar áudio.");
        }
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxSeconds) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microfone não disponível.");
    }
  }

  if (audioUrl) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <UivoPlayer src={audioUrl} />
        <button type="button" onClick={onClear} className="text-xs text-bc-brown hover:underline">
          Remover uivo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={recording ? stop : start}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          recording ? "bg-red-100 text-red-700" : "bg-bc-caramel/15 text-bc-brown"
        }`}
      >
        {recording ? `⏹ Parar (${seconds}s)` : `🐺 Enviar uivo (${maxSeconds}s)`}
      </button>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
