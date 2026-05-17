"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./ToastProvider";

export function EditPostButton({
  postId,
  initialContent,
}: {
  postId: string;
  initialContent: string;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function save() {
    const trimmed = content.trim();
    if (!trimmed) {
      toast("O texto não pode ficar vazio.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (res.ok) {
        toast("Recado atualizado.");
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error ?? "Não foi possível salvar.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setContent(initialContent);
          setOpen(true);
        }}
        className="rounded-lg px-2 py-1 text-sm text-bc-blue/80 transition hover:bg-bc-blue/10 hover:text-bc-blue"
      >
        ✏️ Editar
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div className="bc-animate-scale relative z-10 w-full max-w-md rounded-2xl border-2 border-bc-blue/15 bg-bc-white p-5 shadow-xl">
            <h3 className="mb-3 font-bold text-bc-blue">Editar legenda</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={5}
              className="bc-input resize-y"
              placeholder="Escreva algo… Use #hashtags"
            />
            <p className="mt-1 text-right text-xs text-bc-brown">
              {content.length}/2000
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bc-btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={loading}
                className="bc-btn-primary"
              >
                {loading ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
