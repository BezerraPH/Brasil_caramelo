import type { DogReputationLevel } from "@/generated/prisma/enums";
import {
  DOG_REPUTATION_LEVELS,
  REPUTATION_BY_LEVEL,
  REPUTATION_PERSONALITIES,
  type ReputationPersonality,
} from "./constants";

export type ReputationSummary = {
  totalVotes: number;
  dominant: ReputationPersonality | null;
  breakdown: Record<DogReputationLevel, number>;
  ranked: { personality: ReputationPersonality; count: number; percent: number }[];
};

function emptyBreakdown(): Record<DogReputationLevel, number> {
  return Object.fromEntries(
    DOG_REPUTATION_LEVELS.map((l) => [l, 0]),
  ) as Record<DogReputationLevel, number>;
}

export function summarizeReputation(
  levels: DogReputationLevel[],
): ReputationSummary {
  const breakdown = emptyBreakdown();

  for (const level of levels) {
    if (level in breakdown) {
      breakdown[level] += 1;
    }
  }

  const totalVotes = levels.length;
  if (totalVotes === 0) {
    return { totalVotes: 0, dominant: null, breakdown, ranked: [] };
  }

  let dominantLevel: DogReputationLevel = "CARAMELO";
  let maxCount = 0;
  for (const level of DOG_REPUTATION_LEVELS) {
    if (breakdown[level] > maxCount) {
      maxCount = breakdown[level];
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
