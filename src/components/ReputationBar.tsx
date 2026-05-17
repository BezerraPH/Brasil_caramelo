import { REPUTATION_LEVELS } from "@/lib/constants";
import type { ReputationSummary } from "@/lib/reputation";

type ReputationBarProps = {
  summary: ReputationSummary;
};

export function ReputationBar({ summary }: ReputationBarProps) {
  if (summary.totalVotes === 0) {
    return (
      <p className="text-sm text-bc-brown/80">
        Nenhuma avaliação ainda. Seja o primeiro a dar um latido! 🐾
      </p>
    );
  }

  const stars = Math.round(summary.averageRank);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-3xl" aria-hidden>
          {summary.dominant?.emoji ?? "🐕"}
        </span>
        <div>
          <p className="font-semibold text-bc-blue">
            {summary.dominant?.label ?? "Caramelo"}
          </p>
          <p className="text-xs text-bc-brown">
            {summary.totalVotes} avaliação
            {summary.totalVotes !== 1 ? "ões" : ""} · média{" "}
            {summary.averageRank.toFixed(1)}/5
          </p>
        </div>
      </div>
      <div className="flex gap-0.5" aria-label={`Reputação ${stars} de 5`}>
        {REPUTATION_LEVELS.map((r) => (
          <span
            key={r.level}
            className={`h-2 flex-1 rounded-sm ${
              r.rank <= stars ? "bg-bc-green" : "bg-bc-blue/20"
            }`}
            title={r.label}
          />
        ))}
      </div>
    </div>
  );
}
