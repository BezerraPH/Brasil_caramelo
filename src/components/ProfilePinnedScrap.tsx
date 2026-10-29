"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PinnedPostData = {
  id: string;
  content: string;
  createdAt: string;
};

type ProfilePinnedScrapProps = {
  pinnedPost: PinnedPostData | null;
  isOwnProfile: boolean;
  username: string;
};

export function ProfilePinnedScrap({
  pinnedPost,
  isOwnProfile,
  username,
}: ProfilePinnedScrapProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(pinnedPost?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSavePinned() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profile/pinned-scrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar recado fixado.");
      }

      setEditing(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnpin() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/profile/pinned-scrap", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erro ao desafixar recado.");
      }

      setText("");
      setEditing(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!pinnedPost && !isOwnProfile) {
    return null;
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-100/40 p-4 shadow-sm dark:border-amber-500/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-900/10">
      {/* Top Header / Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center rounded-lg bg-amber-500/20 px-2 py-0.5 text-xs font-black text-amber-700 dark:text-amber-300">
            📌 RECADO DO DIA
          </span>
          <span className="text-[11px] font-semibold text-bc-brown/60 dark:text-slate-400">
            (Scrapbook Orkut)
          </span>
        </div>

        {isOwnProfile && (
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {!editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setText(pinnedPost?.content ?? "");
                    setEditing(true);
                  }}
                  className="rounded-lg px-2 py-0.5 text-bc-blue hover:bg-bc-blue/10 transition dark:text-sky-400"
                >
                  {pinnedPost ? "✏️ Editar" : "➕ Fixar recado do dia"}
                </button>
                {pinnedPost && (
                  <button
                    type="button"
                    onClick={handleUnpin}
                    className="rounded-lg px-2 py-0.5 text-red-600 hover:bg-red-50 transition dark:text-red-400"
                  >
                    Desafixar
                  </button>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Conteúdo ou Formulário */}
      {editing ? (
        <div className="space-y-2 mt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Qual é o seu recado de ouro para a matilha hoje?…"
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-amber-400/40 bg-bc-white p-3 text-xs text-bc-brown outline-none focus:border-bc-blue dark:bg-slate-900 dark:text-slate-100"
          />
          {errorMsg && (
            <p className="text-xs font-bold text-red-500">{errorMsg}</p>
          )}
          <div className="flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1 font-medium text-bc-brown/70 hover:text-bc-brown dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={loading || !text.trim()}
              onClick={handleSavePinned}
              className="rounded-lg bg-amber-500 px-3 py-1 font-bold text-white hover:bg-amber-600 transition disabled:opacity-50"
            >
              {loading ? "Salvando…" : "Fixar no topo"}
            </button>
          </div>
        </div>
      ) : pinnedPost ? (
        <div className="relative pl-4 mt-2">
          <span className="absolute left-0 top-0 text-3xl font-serif text-amber-400/40 select-none">
            “
          </span>
          <p className="text-sm font-medium leading-relaxed text-amber-950 dark:text-amber-100">
            {pinnedPost.content}
          </p>
          <div className="mt-2 text-[10px] text-amber-800/60 dark:text-amber-300/50">
            Fixado por @{username}
          </div>
        </div>
      ) : (
        <p className="text-xs text-bc-brown/70 dark:text-slate-400 italic">
          Nenhum recado fixado ainda. Clique em &quot;Fixar recado do dia&quot; para deixar um destaque no topo do seu perfil!
        </p>
      )}
    </article>
  );
}
