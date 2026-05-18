"use client";

import { useEffect } from "react";
import { flushOfflinePosts } from "@/lib/offline-post-queue";

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        if (navigator.onLine) void flushOfflinePosts();
      })
      .catch(() => {});

    const onOnline = () => void flushOfflinePosts();
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === "BC_FLUSH_OFFLINE_POSTS") void flushOfflinePosts();
    };

    window.addEventListener("online", onOnline);
    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}
