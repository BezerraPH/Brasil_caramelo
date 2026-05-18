import type { ReactionType } from "@/generated/prisma/enums";

export const REACTIONS: {
  type: ReactionType;
  emoji: string;
  label: string;
}[] = [
  { type: "HEART", emoji: "❤️", label: "Legal" },
  { type: "AUAU", emoji: "🐕", label: "Auau!" },
  { type: "GROWL", emoji: "😤", label: "Rosnado" },
  { type: "WHINE", emoji: "🥺", label: "Chorinho" },
];

export function reactionEmoji(type: ReactionType | string | null): string {
  return REACTIONS.find((r) => r.type === type)?.emoji ?? "🤍";
}
