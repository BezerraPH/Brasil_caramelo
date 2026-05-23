/** Moderação local (texto + heurísticas). Ollama/OpenAI opcionais para imagens. */

import { askOllama } from "./ollama";

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

const OLLAMA_TEXT_PROMPT = `Você modera uma rede social familiar brasileira.
A mensagem abaixo viola regras (ódio, pornografia, spam, golpe)?
Responda uma linha: ALLOW ou BLOCK.`;

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
      return {
        ok: false,
        reason:
          "Mensagem parece spam. Tente encurtar links ou texto repetido.",
      };
    }
  }
  if (trimmed.length > 8000) {
    return { ok: false, reason: "Texto muito longo." };
  }
  return { ok: true };
}

/** Moderação de texto via Ollama (opcional, após heurísticas locais). */
export async function moderateTextWithOllama(
  text: string,
): Promise<ModerationResult> {
  if (!process.env.OLLAMA_BASE_URL?.trim()) return { ok: true };

  const answer = await askOllama([
    { role: "system", content: OLLAMA_TEXT_PROMPT },
    { role: "user", content: text.slice(0, 800) },
  ]);
  if (!answer) return { ok: true };

  const upper = answer.toUpperCase();
  if (upper.includes("BLOCK") || upper.includes("UNSAFE")) {
    return {
      ok: false,
      reason: "Conteúdo sinalizado pelo Cão de Guarda (Ollama local).",
    };
  }
  return { ok: true };
}

/** Pipeline: heurística local → Ollama (se configurado). */
export async function moderateTextFull(text: string): Promise<ModerationResult> {
  const local = moderateText(text);
  if (!local.ok) return local;
  return moderateTextWithOllama(text);
}

/** Heurística leve em imagens (dimensões extremas / arquivo vazio). */
export function moderateImageMeta(
  width: number,
  height: number,
): ModerationResult {
  if (width < 8 || height < 8) {
    return { ok: false, reason: "Imagem inválida." };
  }
  if (width > 12000 || height > 12000) {
    return { ok: false, reason: "Imagem muito grande para processar." };
  }
  const ratio = width / height;
  if (ratio > 25 || ratio < 0.04) {
    return { ok: false, reason: "Proporção da imagem não permitida." };
  }
  return { ok: true };
}

export async function moderateImageBuffer(
  buffer: Buffer,
): Promise<ModerationResult> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buffer).metadata();
    const metaMod = moderateImageMeta(meta.width ?? 0, meta.height ?? 0);
    if (!metaMod.ok) return metaMod;

    const stats = await sharp(buffer)
      .resize(96, 96, { fit: "inside", withoutEnlargement: true })
      .stats();
    const avgStdev =
      stats.channels.reduce((s, c) => s + c.stdev, 0) / stats.channels.length;
    if (avgStdev < 2) {
      return {
        ok: false,
        reason: "Imagem parece inválida ou em branco.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

const OLLAMA_VISION_PROMPT = `Analise esta imagem para uma rede social brasileira familiar.
Contém nudez, pornografia, violência gráfica, símbolos de ódio ou conteúdo claramente impróprio?
Responda em uma linha: SAFE ou UNSAFE.`;

export async function moderateImageWithOllama(
  buffer: Buffer,
): Promise<ModerationResult> {
  const { askOllamaVision } = await import("./ollama");
  const answer = await askOllamaVision(buffer, OLLAMA_VISION_PROMPT);
  if (!answer) return { ok: true };

  const upper = answer.toUpperCase();
  if (upper.includes("UNSAFE") || upper.includes("NSFW")) {
    return {
      ok: false,
      reason: "Imagem sinalizada pelo Cão de Guarda (Ollama local).",
    };
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
