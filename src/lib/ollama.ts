const DEFAULT_MODEL = "llama3.2";
const DEFAULT_VISION_MODEL = "moondream";

export type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[];
};

function ollamaBase(): string | null {
  const base = process.env.OLLAMA_BASE_URL?.trim().replace(/\/$/, "");
  return base || null;
}

/** Chat completion via Ollama self-hosted (POST /api/chat). */
export async function askOllama(
  messages: OllamaChatMessage[],
  model?: string,
): Promise<string | null> {
  const base = ollamaBase();
  if (!base) return null;

  const modelName = model?.trim() || process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelName, messages, stream: false }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      message?: { content?: string };
    };
    const text = data.message?.content?.trim();
    return text ? text.slice(0, 900) : null;
  } catch {
    return null;
  }
}

/** Visão computacional local — imagem em base64 (modelos moondream, llava, etc.). */
export async function askOllamaVision(
  imageBuffer: Buffer,
  prompt: string,
): Promise<string | null> {
  const base = ollamaBase();
  if (!base) return null;

  const model =
    process.env.OLLAMA_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL;
  const b64 = imageBuffer.toString("base64");

  try {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
            images: [b64],
          },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      message?: { content?: string };
    };
    return data.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}
