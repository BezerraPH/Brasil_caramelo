"use client";

import { useState } from "react";
import type { PollResults } from "@/lib/thread-poll";

type ThreadPollCardProps = {
  threadId: string;
  initial: PollResults;
  archived: boolean;
};

export function ThreadPollCard({
  threadId,
  initial,
  archived,
}: ThreadPollCardProps) {
  const [poll, setPoll] = useState(initial);
  const [voting, setVoting] = useState(false);

  async function vote(optionId: string) {
    if (archived || poll.myVoteOptionId || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/packs/threads/${threadId}/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json();
      if (res.ok && data.poll) setPoll(data.poll);
    } finally {
      setVoting(false);
    }
  }

  const hasVoted = Boolean(poll.myVoteOptionId);

  return (
    <section className="mt-4 rounded-xl border-2 border-bc-green/30 bg-bc-green/5 p-4">
      <h2 className="text-sm font-bold text-bc-green">
        📊 Enquete
        {poll.question && (
          <span className="ml-1 font-normal text-bc-brown">— {poll.question}</span>
        )}
      </h2>
      <p className="mt-1 text-xs text-bc-brown/80">
        {poll.totalVotes} voto{poll.totalVotes !== 1 ? "s" : ""}
        {!hasVoted && !archived && " · escolha uma opção"}
      </p>
      <ul className="mt-3 space-y-2">
        {poll.options.map((opt) => {
          const selected = poll.myVoteOptionId === opt.id;
          return (
            <li key={opt.id}>
              {!hasVoted && !archived ? (
                <button
                  type="button"
                  disabled={voting}
                  onClick={() => vote(opt.id)}
                  className="w-full rounded-lg border border-bc-blue/20 bg-bc-white px-3 py-2 text-left text-sm text-bc-brown transition hover:border-bc-green/40 hover:bg-bc-green/10"
                >
                  {opt.text}
                </button>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={selected ? "font-semibold text-bc-green" : "text-bc-brown"}>
                      {opt.text}
                      {selected && " ✓"}
                    </span>
                    <span className="text-bc-brown/70">
                      {opt.percent}% ({opt.voteCount})
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bc-blue/10">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selected ? "bg-bc-green" : "bg-bc-caramel/60"
                      }`}
                      style={{ width: `${opt.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
