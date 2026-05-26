import type { ReputationSummary } from "@/lib/reputation";
import { REPUTATION_BY_LEVEL } from "@/lib/constants";
import type { DogReputationLevel } from "@/generated/prisma/enums";

type ReputationBarProps = {
  summary: ReputationSummary;
};

function pillStyle(level: DogReputationLevel): string {
  if (level === "CARAMELO") {
    return "bg-[#C68642] text-white border-[#C68642]";
  }
  if (level === "VIRALATA") {
    return "bg-bc-white text-[#8B5E3C] border-[#8B5E3C]";
  }
  return "bg-bc-white text-bc-brown border-bc-blue/20";
}

export function ReputationBar({ summary }: ReputationBarProps) {
  if (summary.totalVotes === 0) {
    return (
      <p className="text-sm text-bc-brown/80">
        Ninguém votou ainda na personalidade desta conta.
      </p>
    );
  }

  const d = summary.dominant!;
  const topThree = summary.ranked.slice(0, 3);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bc-green">
          Gráfico da Matilha
        </p>
        <div className="flex h-3 overflow-hidden rounded-full bg-bc-blue/10">
          {topThree.map(({ personality, percent }) => (
            <div
              key={personality.level}
              className="h-full transition-all"
              style={{
                width: `${percent}%`,
                backgroundColor:
                  personality.level === "CARAMELO"
                    ? "#C68642"
                    : personality.level === "VIRALATA"
                      ? "#8B5E3C"
                      : "var(--bc-green)",
              }}
              title={`${personality.breed} ${percent}%`}
            />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {topThree.map(({ personality, count, percent }) => (
            <li
              key={personality.level}
              className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${pillStyle(personality.level)}`}
              title={personality.about}
            >
              {personality.emoji} {personality.breed}{" "}
              <span className="opacity-90">
                {count} ({percent}%)
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border-2 border-bc-green/40 bg-gradient-to-br from-bc-white to-bc-green/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-bc-green">
          Personalidade dominante
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

      {summary.ranked.length > 3 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-bc-blue">Outros votos</p>
          <ul className="flex flex-wrap gap-2">
            {summary.ranked.slice(3, 7).map(({ personality, count, percent }) => {
              const p = REPUTATION_BY_LEVEL[personality.level];
              return (
                <li
                  key={personality.level}
                  className="rounded-full border border-bc-blue/20 bg-bc-white px-2.5 py-1 text-xs text-bc-brown"
                  title={p.about}
                >
                  {p.emoji} {p.breed}{" "}
                  <span className="font-medium text-bc-green">
                    {count} ({percent}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
