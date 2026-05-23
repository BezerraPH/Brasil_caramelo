"use client";

import Link from "next/link";
import { feedPostPath } from "@/lib/feed-post-link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { formatAchievementToast } from "@/lib/achievement-defs";
import type { AchievementKey } from "@/lib/achievement-defs";
import { useToast } from "./ToastProvider";

type Tab = "open" | "history" | "mine";

type Parecer = {
  choice: string;
  opinion: string;
  juror: { name: string; username: string };
};

type CaseItem = {
  id: string;
  postId: string;
  status: string;
  votesKeep: number;
  votesRemove: number;
  resolvedAt: string | null;
  myVote: string | null;
  pareceres: Parecer[];
  post: {
    id: string;
    content: string;
    tribunalHidden: boolean;
    author: { username: string; name: string };
    _count: { reports: number };
  };
};

export function TribunalPanel() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("open");
  const [juror, setJuror] = useState(false);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [opinions, setOpinions] = useState<Record<string, string>>({});
  const [votingId, setVotingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/tribunal?tab=${tab}`);
    const data = await res.json();
    if (res.ok) {
      setJuror(Boolean(data.juror));
      setCases(data.cases ?? []);
    }
    setLoading(false);
  }, [tab]);

  useAsyncEffect(() => {
    void load();
  }, [load]);

  async function vote(caseId: string, choice: "KEEP" | "REMOVE") {
    setVotingId(caseId);
    const opinion = opinions[caseId]?.trim().slice(0, 280);
    try {
      const res = await fetch(`/api/tribunal/${caseId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice, opinion: opinion || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.newAchievement) {
          toast(
            formatAchievementToast(data.newAchievement as AchievementKey),
            "achievement",
          );
        }
        if (data.coinsAwarded > 0) {
          toast(
            `+${data.coinsAwarded} CarameloCoins por julgar na matilha ⚖️`,
            "achievement",
          );
        }
        setOpinions((prev) => {
          const next = { ...prev };
          delete next[caseId];
          return next;
        });
        await load();
      } else {
        toast(data.error ?? "Não foi possível registrar o voto.");
      }
    } finally {
      setVotingId(null);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "open", label: "Abertos" },
    { id: "history", label: "Histórico" },
    { id: "mine", label: "Meus recados" },
  ];

  return (
    <div className="space-y-6">
      <section className="bc-card bc-tribunal-header bc-animate-in p-5 text-center">
        <h2 className="text-2xl font-bold text-bc-blue">⚖️ Tribunal do Cão</h2>
        <p className="mt-2 text-sm text-bc-brown">
          Recados com 3+ denúncias vão a julgamento. Jurados:{" "}
          <strong>Border Collie</strong> ou <strong>Poodle</strong>.
        </p>
        {juror ? (
          <p className="mt-2 text-xs font-semibold text-bc-green">
            Vote e opcionalmente redija um parecer (+8 coins/voto, até 5/dia).
          </p>
        ) : (
          <p className="mt-2 text-xs text-bc-brown">
            Receba votos de reputação nessas raças para ser jurado.
          </p>
        )}
      </section>

      <div className="bc-tribunal-tabs flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "bc-btn-primary text-xs"
                : "bc-btn-secondary text-xs"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="bc-card bc-animate-pulse p-8 text-center text-bc-brown">
          Abrindo o Tribunal…
        </p>
      ) : cases.length === 0 ? (
        <p className="bc-card p-10 text-center text-bc-brown">
          {tab === "open"
            ? "Nenhum caso aberto — a matilha está em paz. 🐕"
            : tab === "history"
              ? "Nenhum julgamento encerrado ainda."
              : "Nenhum dos seus recados está no Tribunal."}
        </p>
      ) : (
        cases.map((c, i) => (
          <article
            key={c.id}
            className="bc-tribunal-case bc-card bc-animate-in-up p-5"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold text-bc-caramel">
                {c.post._count.reports} denúncias · @{c.post.author.username}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  c.status === "OPEN"
                    ? "bg-bc-caramel/20 text-bc-brown"
                    : c.status === "REMOVED"
                      ? "bg-red-500/15 text-red-800"
                      : "bg-bc-green/15 text-bc-green"
                }`}
              >
                {c.status === "OPEN"
                  ? "Em julgamento"
                  : c.status === "REMOVED"
                    ? "Removido"
                    : "Mantido"}
              </span>
            </div>
            <p className="mt-2 line-clamp-4 text-sm text-bc-brown">
              {c.post.content || "—"}
            </p>
            {tab !== "history" && !c.post.tribunalHidden && (
              <Link
                href={feedPostPath(c.post.id)}
                className="mt-2 inline-block text-xs text-bc-blue hover:underline"
              >
                Ver recado no feed →
              </Link>
            )}
            {c.post.tribunalHidden && c.status === "REMOVED" && (
              <p className="mt-2 text-xs text-bc-brown/70">
                Recado removido — não aparece mais no feed.
              </p>
            )}
            <div className="mt-3 flex gap-4 text-center text-xs">
              <span className="text-bc-green">Manter: {c.votesKeep}</span>
              <span className="text-red-600">Remover: {c.votesRemove}</span>
            </div>

            {c.pareceres.length > 0 && (
              <ul className="bc-tribunal-pareceres mt-4 space-y-2">
                {c.pareceres.map((p, j) => (
                  <li
                    key={`${p.juror.username}-${j}`}
                    className="rounded-lg border border-bc-blue/10 bg-bc-blue/5 px-3 py-2 text-xs"
                  >
                    <p className="font-semibold text-bc-blue">
                      @{p.juror.username}{" "}
                      <span className="font-normal text-bc-brown">
                        ({p.choice === "KEEP" ? "manter" : "remover"})
                      </span>
                    </p>
                    <p className="mt-1 text-bc-brown">{p.opinion}</p>
                  </li>
                ))}
              </ul>
            )}

            {tab === "open" && juror && !c.myVote && (
              <div className="mt-4 space-y-2">
                <label className="block text-[10px] font-semibold text-bc-brown">
                  Parecer opcional (até 280 caracteres)
                </label>
                <textarea
                  value={opinions[c.id] ?? ""}
                  onChange={(e) =>
                    setOpinions((prev) => ({
                      ...prev,
                      [c.id]: e.target.value.slice(0, 280),
                    }))
                  }
                  rows={2}
                  className="bc-input w-full resize-none text-xs"
                  placeholder="Explique seu voto para a matilha…"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={votingId === c.id}
                    onClick={() => void vote(c.id, "KEEP")}
                    className="bc-btn-secondary flex-1 text-xs"
                  >
                    ✅ Mal-entendido
                  </button>
                  <button
                    type="button"
                    disabled={votingId === c.id}
                    onClick={() => void vote(c.id, "REMOVE")}
                    className="bc-btn-primary flex-1 text-xs"
                  >
                    🚫 Remover
                  </button>
                </div>
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
