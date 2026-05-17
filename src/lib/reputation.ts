import type { DogReputationLevel } from "@/generated/prisma/enums";
import { LEVEL_RANK, REPUTATION_LEVELS } from "./constants";

export type ReputationSummary = {
  averageRank: number;
  totalVotes: number;
  dominant: (typeof REPUTATION_LEVELS)[number] | null;
  breakdown: Record<DogReputationLevel, number>;
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
    return { averageRank: 0, totalVotes: 0, dominant: null, breakdown };
  }

  const averageRank =
    levels.reduce((sum, l) => sum + LEVEL_RANK[l], 0) / totalVotes;

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

  const dominant =
    REPUTATION_LEVELS.find((r) => r.level === dominantLevel) ?? null;

  return { averageRank, totalVotes, dominant, breakdown };
}
