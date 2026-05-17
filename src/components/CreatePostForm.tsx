"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setContent("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border-2 border-bc-blue/30 bg-bc-white p-4 shadow-sm"
    >
      <label htmlFor="recado" className="mb-2 block text-sm font-semibold text-bc-blue">
        Escrever recado
      </label>
      <textarea
        id="recado"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="O que você está aprontando hoje?"
        className="w-full resize-none rounded-lg border border-bc-brown/30 p-3 text-sm focus:border-bc-green focus:outline-none focus:ring-2 focus:ring-bc-green/30"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-lg bg-bc-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-bc-green/90 disabled:opacity-50"
        >
          {loading ? "Publicando…" : "Publicar recado"}
        </button>
      </div>
    </form>
  );
}
