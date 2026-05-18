/** Moderação local (texto + heurísticas). OpenAI opcional para imagens. */

const BLOCKED_PATTERNS = [
  /\b(porn[oô]?|xxx|nsfw|nudez|nudes)\b/i,
  /\b(terroris[mt]a|nazismo|supremac)\b/i,
  /\b(venda\s+de\s+drogas|maconha\s+barata)\b/i,
];

const SPAM_PATTERNS = [
  /(https?:\/\/){3,}/i,
  /(.)\1{12,}/,
];

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function moderateText(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true };

  for (const p of BLOCKED_PATTERNS) {
    if (p.test(trimmed)) {
      return { ok: false, reason: "Conteúdo não permitido na matilha." };
    }
  }
  for (const p of SPAM_PATTERNS) {
    if (p.test(trimmed)) {
      return { ok: false, reason: "Mensagem parece spam. Tente encurtar links ou texto repetido." };
    }
  }
  if (trimmed.length > 8000) {
    return { ok: false, reason: "Texto muito longo." };
  }
  return { ok: true };
}

/** Heurística leve em imagens (dimensões extremas / arquivo vazio). */
export function moderateImageMeta(width: number, height: number): ModerationResult {
  if (width < 8 || height < 8) {
    return { ok: false, reason: "Imagem inválida." };
  }
  if (width > 12000 || height > 12000) {
    return { ok: false, reason: "Imagem muito grande para processar." };
  }
  return { ok: true };
}

export async function moderateImageWithOpenAI(
  imageUrl: string,
): Promise<ModerationResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { ok: true };

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: imageUrl }),
    });
    if (!res.ok) return { ok: true };
    const data = (await res.json()) as {
      results?: { flagged?: boolean; categories?: Record<string, boolean> }[];
    };
    const flagged = data.results?.[0]?.flagged;
    if (flagged) {
      return {
        ok: false,
        reason: "Imagem sinalizada pelo Cão de Guarda. Escolha outra foto.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}
