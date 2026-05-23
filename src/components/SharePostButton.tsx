"use client";

import { feedPostPath } from "@/lib/feed-post-link";
import { useToast } from "./ToastProvider";

export function SharePostButton({ postId }: { postId: string }) {
  const toast = useToast();

  async function share() {
    const path = feedPostPath(postId);
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Brasil Caramelo",
          text: "Olha esse recado na matilha!",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link copiado!");
    } catch {
      toast("Não foi possível compartilhar.");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="bc-share-btn rounded-lg px-2 py-1 text-sm text-bc-brown transition hover:bg-bc-blue/10 hover:text-bc-blue"
    >
      ↗ Compartilhar
    </button>
  );
}
