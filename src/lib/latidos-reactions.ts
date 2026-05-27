export const LATIDOS_REACTIONS = [
  { id: "paw", emoji: "🐾", label: "Levantar a pata" },
  { id: "auau", emoji: "🐕", label: "Au au!" },
  { id: "clap", emoji: "👏", label: "Aplauso" },
  { id: "heart", emoji: "❤️", label: "Amor" },
  { id: "cheese", emoji: "🧀", label: "Pão de queijo" },
] as const;

export type LatidosReactionPayload = {
  type: "reaction";
  emoji: string;
  name: string;
};

export function encodeLatidosReaction(payload: LatidosReactionPayload): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(payload));
}

export function decodeLatidosReaction(data: Uint8Array): LatidosReactionPayload | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(data)) as LatidosReactionPayload;
    if (parsed?.type === "reaction" && parsed.emoji) return parsed;
    return null;
  } catch {
    return null;
  }
}
