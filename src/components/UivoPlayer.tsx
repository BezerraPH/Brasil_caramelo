"use client";

import { useCallback, useRef, useState } from "react";

type UivoPlayerProps = {
  src: string;
  className?: string;
};

/** Recado de áudio (Uivo) — onda sonora nas cores do tema. */
export function UivoPlayer({ src, className = "" }: UivoPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  }, [playing]);

  return (
    <div className={`bc-uivo-player flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bc-caramel/20 text-lg transition hover:bg-bc-caramel/35"
        aria-label={playing ? "Pausar uivo" : "Ouvir uivo"}
      >
        {playing ? "⏸" : "🐺"}
      </button>
      <div className="bc-uivo-wave flex flex-1 items-end gap-0.5" aria-hidden>
        {[3, 5, 8, 6, 9, 4, 7, 5, 8, 3, 6, 9, 5, 4].map((h, i) => (
          <span
            key={i}
            className={`bc-uivo-bar w-1 rounded-full bg-bc-caramel ${playing ? "bc-uivo-bar--active" : ""}`}
            style={{ height: `${h * 3}px`, animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
