import type { DogReputationLevel } from "@/generated/prisma/enums";
import { DOG_REPUTATION_LEVELS, REPUTATION_BY_LEVEL } from "./constants";
import { prisma } from "./prisma";
import { summarizeReputation } from "./reputation";

/** Personalidades que podem atuar como jurados no Tribunal do Cão. */
export const TRIBUNAL_JUROR_LEVELS = new Set<DogReputationLevel>([
  "BORDER_COLLIE",
  "POODLE",
]);

export async function getUserDominantLevel(
  userId: string,
): Promise<DogReputationLevel | null> {
  const reps = await prisma.reputation.findMany({
    where: { toUserId: userId },
    select: { level: true },
  });
  return summarizeReputation(reps.map((r) => r.level)).dominant?.level ?? null;
}

export async function isTribunalJuror(userId: string): Promise<boolean> {
  const level = await getUserDominantLevel(userId);
  return level !== null && TRIBUNAL_JUROR_LEVELS.has(level);
}

export function pickRandomLevel(): DogReputationLevel {
  return DOG_REPUTATION_LEVELS[
    Math.floor(Math.random() * DOG_REPUTATION_LEVELS.length)
  ]!;
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) return [198, 134, 66];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;
}

export function mixPetColors(colorA: string, colorB: string): string {
  const [r1, g1, b1] = parseHex(colorA);
  const [r2, g2, b2] = parseHex(colorB);
  const jitter = () => (Math.random() - 0.5) * 24;
  return toHex(
    (r1 + r2) / 2 + jitter(),
    (g1 + g2) / 2 + jitter(),
    (b1 + b2) / 2 + jitter(),
  );
}

/** Algoritmo DNA Caramelo — mescla personalidades dominantes dos pais. */
export function computeOffspringDna(
  parentALevel: DogReputationLevel,
  parentBLevel: DogReputationLevel,
  parentAColor: string,
  parentBColor: string,
): { dnaLevel: DogReputationLevel; color: string; name: string } {
  const roll = Math.random();
  let dnaLevel: DogReputationLevel;
  if (roll < 0.42) dnaLevel = parentALevel;
  else if (roll < 0.84) dnaLevel = parentBLevel;
  else dnaLevel = pickRandomLevel();

  const breed = REPUTATION_BY_LEVEL[dnaLevel];
  return {
    dnaLevel,
    color: mixPetColors(parentAColor, parentBColor),
    name: `Filhote ${breed.breed}`,
  };
}
