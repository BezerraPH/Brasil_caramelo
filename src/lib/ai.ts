import type { DogReputationLevel } from "@/generated/prisma/enums";
import { REPUTATION_BY_LEVEL } from "./constants";

const VIBE_PROMPTS: Record<DogReputationLevel, string> = {
  PITBULL: "direto, intenso, sem rodeios",
  HUSKY: "dramático, exagerado, reclamão engraçado",
  CARAMELO: "raiz, gente boa, meme brasileiro",
  POODLE: "elegante, minimalista, estético",
  PINSCHER: "briguento, sarcástico, pavio curto",
  GOLDEN: "alegre, biscoiteiro, positivo demais",
  VIRALATA: "relax, desleixado, autêntico",
  BORDER_COLLIE: "produtivo, lista de dicas",
  BASSET_HOUND: "preguiçoso, poucas palavras",
  CHOW_CHOW: "frio, antissocial, seletivo",
};

export async function suggestCaption(
  level: DogReputationLevel,
  hint?: string,
): Promise<string | null> {
  const personality = REPUTATION_BY_LEVEL[level];
  const vibe = VIBE_PROMPTS[level];
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    const templates = [
      `${personality.emoji} Mais um dia na matilha ${personality.breed}!`,
      `Vibe ${vibe} — ${hint ?? "foto do momento"}`,
      `${personality.vibe}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)] ?? null;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você escreve legendas curtas (máx 120 chars) para rede social brasileira. Tom: ${vibe}. Raça: ${personality.breed}.`,
          },
          {
            role: "user",
            content: hint
              ? `Sugira legenda para foto: ${hint}`
              : "Sugira legenda genérica para post de cachorro.",
          },
        ],
        max_tokens: 80,
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text?.slice(0, 200) ?? null;
  } catch {
    return `${personality.emoji} ${personality.vibe}`.slice(0, 120);
  }
}
