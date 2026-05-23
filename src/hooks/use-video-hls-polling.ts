"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";

const POLL_MS = 3000;
const MAX_ATTEMPTS = 30;

/** Consulta GET /api/posts/[id]/video até HLS ficar pronto. */
export function useVideoHlsPolling(postId: string | null) {
  const toast = useToast();
  const [processing, setProcessing] = useState(false);
  const [hlsReady, setHlsReady] = useState(false);

  useEffect(() => {
    if (!postId) return;

    let cancelled = false;

    void (async () => {
      setProcessing(true);
      setHlsReady(false);

      for (let attempts = 0; attempts < MAX_ATTEMPTS && !cancelled; attempts += 1) {
        try {
          const res = await fetch(`/api/posts/${postId}/video`);
          const data = (await res.json()) as {
            hlsReady?: boolean;
          };
          if (cancelled) return;
          if (res.ok && data.hlsReady) {
            setHlsReady(true);
            setProcessing(false);
            toast("🎬 Vídeo otimizado para streaming!");
            return;
          }
        } catch {
          /* retry */
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }

      if (!cancelled) setProcessing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [postId, toast]);

  if (!postId) {
    return { processing: false, hlsReady: false };
  }

  return { processing, hlsReady };
}
