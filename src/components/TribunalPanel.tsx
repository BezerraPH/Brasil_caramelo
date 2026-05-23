"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { formatAchievementToast } from "@/lib/achievement-defs";
import type { AchievementKey } from "@/lib/achievement-defs";
import { useToast } from "./ToastProvider";

type CaseItem = {
  id: string;
  postId: string;
  votesKeep: number;
  votesRemove: number;
  myVote: string | null;
  post: {
    content: string;
    author: { username: string; name: string };
    _count: { reports: number };
  };
};

export function TribunalPanel() {
  const toast = useToast();
  const [juror, setJuror] = useState(false);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/tribunal");
    const data = await res.json();
    if (res.ok) {
      setJuror(Boolean(data.juror));
      setCases(data.cases ?? []);
    }
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  async function vote(caseId: string, choice: "KEEP" | "REMOVE") {
    const res = await fetch(`/api/tribunal/${caseId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.newAchievement) {
        toast(formatAchievementToast(data.newAchievement as AchievementKey), "achievement");
      }
      await load();
    }
  }

  if (loading) {
    return (
      <p className="bc-card p-8 text-center text-bc-brown">Abrindo o Tribunal…</p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bc-card bc-tribunal-header p-5 text-center">
        <h2 className="text-2xl font-bold text-bc-blue">⚖️ Tribunal do Cão</h2>
        <p className="mt-2 text-sm text-bc-brown">
          Recados com muitas denúncias vão a julgamento. Jurados: personalidade{" "}
          <strong>Border Collie</strong> ou <strong>Poodle</strong>.
        </p>
        {juror ? (
          <p className="mt-2 text-xs font-semibold text-bc-green">
            Você pode votar como jurado.
          </p>
        ) : (
          <p className="mt-2 text-xs text-bc-brown">
            Receba votos de reputação nessas raças para ser jurado.
          </p>
        )}
      </section>

      {cases.length === 0 ? (
        <p className="bc-card p-10 text-center text-bc-brown">
          Nenhum caso aberto — a matilha está em paz. 🐕
        </p>
      ) : (
        cases.map((c, i) => (
          <article
            key={c.id}
            className="bc-tribunal-case bc-card bc-animate-in-up p-5"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className="text-[10px] font-semibold text-bc-caramel">
              {c.post._count.reports} denúncias · @{c.post.author.username}
            </p>
            <p className="mt-2 line-clamp-4 text-sm text-bc-brown">
              {c.post.content || "—"}
            </p>
            <div className="mt-3 flex gap-4 text-center text-xs">
              <span className="text-bc-green">Manter: {c.votesKeep}</span>
              <span className="text-red-600">Remover: {c.votesRemove}</span>
            </div>
            {juror && !c.myVote && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void vote(c.id, "KEEP")}
                  className="bc-btn-secondary flex-1 text-xs"
                >
                  ✅ Mal-entendido
                </button>
                <button
                  type="button"
                  onClick={() => void vote(c.id, "REMOVE")}
                  className="bc-btn-primary flex-1 text-xs"
                >
                  🚫 Remover
                </button>
              </div>
            )}
            {c.myVote && (
              <p className="mt-3 text-xs text-bc-green">Você votou: {c.myVote}</p>
            )}
          </article>
        ))
      )}
    </div>
  );
}
