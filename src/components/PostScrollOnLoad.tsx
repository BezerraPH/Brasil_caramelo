"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function PostScrollOnLoad() {
  const params = useSearchParams();
  const postId = params.get("post");

  useEffect(() => {
    if (!postId) return;
    const el = document.getElementById(`post-${postId}`);
    if (el) {
      el.classList.add("ring-2", "ring-bc-caramel", "ring-offset-2");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const t = setTimeout(() => {
        el.classList.remove("ring-2", "ring-bc-caramel", "ring-offset-2");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [postId]);

  return null;
}
