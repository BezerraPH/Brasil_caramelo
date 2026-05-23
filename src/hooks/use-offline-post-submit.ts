"use client";

import type { AchievementKey } from "@/lib/achievement-defs";
import { useCallback } from "react";
import { enqueueOfflinePost, registerBackgroundSync } from "@/lib/offline-post-queue";

export type PostSubmitResult =
  | {
      status: "ok";
      postId: string;
      newAchievements: AchievementKey[];
      videoProcessing: boolean;
    }
  | { status: "queued" }
  | { status: "error" };

export function useOfflinePostSubmit() {
  return useCallback(
    async (
      payload: {
        content: string;
        imageUrl?: string;
        videoUrl?: string;
        videoHlsUrl?: string;
        communityLevel?: string;
      },
      onError: (msg: string) => void,
    ): Promise<PostSubmitResult> => {
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          return {
            status: "ok",
            postId: data.post.id as string,
            newAchievements: (data.newAchievements ?? []) as AchievementKey[],
            videoProcessing: Boolean(data.videoProcessing),
          };
        }
        onError(data.error ?? "Não foi possível publicar.");
        return { status: "error" };
      } catch {
        await enqueueOfflinePost(payload);
        await registerBackgroundSync();
        return { status: "queued" };
      }
    },
    [],
  );
}
