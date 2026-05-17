import type { DogReputationLevel } from "@/generated/prisma/enums";
import {
  REPUTATION_BY_LEVEL,
  REPUTATION_PERSONALITIES,
  type ReputationPersonality,
} from "./constants";

export type ReputationSummary = {
  totalVotes: number;
  dominant: ReputationPersonality | null;
  breakdown: Record<DogReputationLevel, number>;
  /** Personalidades com pelo menos 1 voto, da mais votada para a menos */
  ranked: { personality: ReputationPersonality; count: number; percent: number }[];
};

export function summarizeReputation(
  levels: DogReputationLevel[],
): ReputationSummary {
  const breakdown: Record<DogReputationLevel, number> = {
    PITBULL: 0,
    POODLE: 0,
    SALSICHA: 0,
    VIRALATA: 0,
    CARAMELO: 0,
  };

  for (const level of levels) {
    breakdown[level] += 1;
  }

  const totalVotes = levels.length;
  if (totalVotes === 0) {
    return { totalVotes: 0, dominant: null, breakdown, ranked: [] };
  }

  let dominantLevel: DogReputationLevel = "CARAMELO";
  let maxCount = 0;
  for (const [level, count] of Object.entries(breakdown) as [
    DogReputationLevel,
    number,
  ][]) {
    if (count > maxCount) {
      maxCount = count;
      dominantLevel = level;
    }
  }

  const dominant = REPUTATION_BY_LEVEL[dominantLevel] ?? null;

  const ranked = REPUTATION_PERSONALITIES.map((personality) => ({
    personality,
    count: breakdown[personality.level],
    percent: Math.round((breakdown[personality.level] / totalVotes) * 100),
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return { totalVotes, dominant, breakdown, ranked };
}
