import type { ReputationSummary } from "@/lib/reputation";
import { REPUTATION_PERSONALITIES } from "@/lib/constants";
import type { DogReputationLevel } from "@/generated/prisma/enums";

/** Rótulos estilo Orkut moderno (mock new_orkut.html) por vibe canina. */
const ORKUT_VIBE_LABEL: Partial<Record<DogReputationLevel, string>> = {
  POODLE: "Estiloso",
  PITBULL: "Intenso",
  GOLDEN: "Confiável",
  CARAMELO: "Raiz",
  BORDER_COLLIE: "Esperto",
  HUSKY: "Dramático",
  PINSCHER: "Direto",
  VIRALATA: "Desencanado",
  BASSET_HOUND: "Zen",
  CHOW_CHOW: "Misterioso",
};

type ReputationOrkutPillsProps = {
  summary: ReputationSummary;
};

export function ReputationOrkutPills({ summary }: ReputationOrkutPillsProps) {
  if (summary.totalVotes === 0) {
    return (
      <p className="text-sm text-bc-brown/80">
        Ninguém votou na personalidade ainda — seja o primeiro com o botão P.
      </p>
    );
  }

  const topThree =
    summary.ranked.length > 0
      ? summary.ranked.slice(0, 3)
      : REPUTATION_PERSONALITIES.slice(0, 3).map((p) => ({
          personality: p,
          count: 0,
          percent: 0,
        }));

  return (
    <div className="bc-orkut-ratings space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-bc-green">
        Avaliações da matilha
      </p>
      <div className="flex flex-wrap gap-2">
        {topThree.map(({ personality, count, percent }) => (
          <div
            key={personality.level}
            className="bc-orkut-rating-pill bc-animate-in"
            title={personality.about}
          >
            <span className="text-lg" aria-hidden>
              {personality.emoji}
            </span>
            <span className="bc-orkut-rating-pill-label">
              {ORKUT_VIBE_LABEL[personality.level] ?? personality.breed}
            </span>
            <span className="bc-orkut-rating-pill-value">
              {count > 0 ? `${percent}%` : "—"}
            </span>
          </div>
        ))}
      </div>
      {summary.dominant && (
        <p className="text-xs text-bc-brown/80">
          Dominante: <strong>{summary.dominant.breed}</strong>{" "}
          {summary.dominant.emoji}
        </p>
      )}
    </div>
  );
}
