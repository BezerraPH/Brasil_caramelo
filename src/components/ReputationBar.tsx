import type { ReputationSummary } from "@/lib/reputation";

type ReputationBarProps = {
  summary: ReputationSummary;
};

export function ReputationBar({ summary }: ReputationBarProps) {
  if (summary.totalVotes === 0) {
    return (
      <p className="text-sm text-bc-brown/80">
        Ninguém votou ainda na personalidade desta conta.
      </p>
    );
  }

  const d = summary.dominant!;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-bc-green/40 bg-gradient-to-br from-bc-white to-bc-green/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-bc-green">
          Personalidade da conta
        </p>
        <div className="mt-2 flex items-start gap-3">
          <span className="text-4xl" aria-hidden>
            {d.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-bc-blue">{d.breed}</p>
            <p className="mt-1 text-sm text-bc-brown">{d.about}</p>
            <p className="mt-2 rounded-lg bg-bc-blue/5 px-3 py-2 text-sm italic text-bc-brown">
              &ldquo;{d.vibe}&rdquo;
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-bc-brown">
          {summary.ranked[0]?.count ?? 0} de {summary.totalVotes} latido
          {summary.totalVotes !== 1 ? "s" : ""} ({summary.ranked[0]?.percent ?? 0}
          %)
        </p>
      </div>

      {summary.ranked.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-bc-blue">
            Outros votos
          </p>
          <ul className="flex flex-wrap gap-2">
            {summary.ranked.slice(1, 5).map(({ personality, count, percent }) => (
              <li
                key={personality.level}
                className="rounded-full border border-bc-blue/20 bg-bc-white px-2.5 py-1 text-xs text-bc-brown"
                title={personality.about}
              >
                {personality.emoji} {personality.breed}{" "}
                <span className="font-medium text-bc-green">
                  {count} ({percent}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
