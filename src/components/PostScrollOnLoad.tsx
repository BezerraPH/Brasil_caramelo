"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function resolvePostId(searchPost: string | null): string | null {
  if (searchPost) return searchPost;
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (hash.startsWith("#post-")) return hash.slice(6);
  return null;
}

export function PostScrollOnLoad() {
  const params = useSearchParams();
  const searchPost = params.get("post");

  useEffect(() => {
    const postId = resolvePostId(searchPost);
    if (!postId) return;

    let ringTimer: ReturnType<typeof setTimeout> | undefined;

    function highlight() {
      const el = document.getElementById(`post-${postId}`);
      if (!el) return;
      el.classList.add("ring-2", "ring-bc-caramel", "ring-offset-2");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      ringTimer = setTimeout(() => {
        el.classList.remove("ring-2", "ring-bc-caramel", "ring-offset-2");
      }, 3000);
    }

    const timers = [200, 800, 1600].map((ms) => setTimeout(highlight, ms));

    return () => {
      timers.forEach(clearTimeout);
      if (ringTimer) clearTimeout(ringTimer);
    };
  }, [searchPost]);

  return null;
}
