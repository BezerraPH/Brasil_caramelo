import { REPUTATION_PERSONALITIES } from "@/lib/constants";
import type { ReputationSummary } from "@/lib/reputation";

type ReputationBarProps = {
  summary: ReputationSummary;
};

export function ReputationBar({ summary }: ReputationBarProps) {
  if (summary.totalVotes === 0) {
    return (
      <p className="text-sm text-bc-brown/80">
        Nenhuma personalidade registrada ainda. Seja o primeiro a latir! 🐾
      </p>
    );
  }

  const d = summary.dominant!;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-bc-blue/20 bg-bc-white/80 p-4">
        <div className="flex items-start gap-3">
          <span className="text-4xl" aria-hidden>
            {d.emoji}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-bc-green">
              Personalidade dominante
            </p>
            <p className="text-lg font-bold text-bc-blue">
              {d.archetype}
              <span className="ml-1 text-base font-normal text-bc-brown">
                · {d.breed}
              </span>
            </p>
            <p className="mt-1 text-sm font-medium text-bc-brown">{d.profile}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {d.behavior}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-bc-brown">
          {summary.totalVotes} latido{summary.totalVotes !== 1 ? "s" : ""} no total
        </p>
      </div>

      {summary.ranked.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-bc-blue">
            Como a galera enxerga
          </p>
          <ul className="space-y-2">
            {summary.ranked.map(({ personality, count, percent }) => (
              <li key={personality.level}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="text-bc-brown">
                    {personality.emoji} {personality.archetype}
                  </span>
                  <span className="text-bc-brown/80">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bc-blue/15">
                  <div
                    className="h-full rounded-full bg-bc-green transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-bc-brown/60">
        Em breve: mais raças ({REPUTATION_PERSONALITIES.length} de 10+ perfis)
      </p>
    </div>
  );
}
