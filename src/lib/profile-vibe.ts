import type { ViewMode } from "@/generated/prisma/enums";

export const PROFILE_VIBE_LABELS: Record<ViewMode, string> = {
  FEED: "Orkut",
  INSTA: "Insta",
  REELS: "Cinelar",
};

export const PROFILE_VIBE_EMOJI: Record<ViewMode, string> = {
  FEED: "📰",
  INSTA: "📷",
  REELS: "🎬",
};

export function isPatioKing(until: Date | null | undefined): boolean {
  if (!until) return false;
  return until.getTime() > Date.now();
}
