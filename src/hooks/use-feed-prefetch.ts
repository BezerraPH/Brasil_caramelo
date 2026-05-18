"use client";

import { useEffect } from "react";

type PrefetchPost = {
  imageUrl?: string | null;
  videoUrl?: string | null;
};

function prefetchUrl(url: string, as: "image" | "video") {
  if (as === "image") {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    return;
  }
  fetch(url, {
    headers: { Range: "bytes=0-262143" },
    credentials: "same-origin",
  }).catch(() => {});
}

export function useFeedPrefetch(posts: PrefetchPost[], activeIndex: number) {
  useEffect(() => {
    const next = posts[activeIndex + 1];
    if (!next) return;
    if (next.imageUrl?.startsWith("/api/media/")) {
      prefetchUrl(next.imageUrl, "image");
    }
    if (next.videoUrl?.startsWith("/api/media/")) {
      prefetchUrl(next.videoUrl, "video");
    }
  }, [posts, activeIndex]);
}
