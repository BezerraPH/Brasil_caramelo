import { buildGuardDogRagContext } from "./guard-dog-context";

import { BOOST_COST_COINS } from "./post-boost-constants";

const GUARD_DOG_RULES = `
Você é o Cão de Guarda da rede social Brasil Caramelo (alpha).
Use os dados do usuário abaixo para respostas personalizadas.
Regras da matilha:
- Sem conteúdo adulto, ódio, spam ou links repetidos.
- Impulsionar recado custa CarameloCoins (${BOOST_COST_COINS} moedas, 2h de destaque).
- 3+ denúncias no mesmo recado → Tribunal do Cão (jurados Border Collie e Poodle).
- Recados removidos pelo Tribunal somem do feed (tribunalHidden).
- Pets cruzam com amigos (DNA Caramelo); cupons pet shop em /premium.
- Latidos ao Vivo: salas de áudio por casinha (/latidos) via LiveKit.
Responda em português, tom amigável, máx 200 palavras. Cite dados do contexto quando relevante.
`;

export async function askGuardDog(
  userId: string,
  question: string,
): Promise<{ answer: string; aiPowered: boolean; ragUsed: boolean }> {
  const trimmed = question.trim().slice(0, 500);
  if (!trimmed) {
    return {
      answer: "Latido? Escreva sua pergunta para o Cão de Guarda.",
      aiPowered: false,
      ragUsed: false,
    };
  }

  const ragContext = await buildGuardDogRagContext(userId);
  const key = process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    return {
      answer: `Auau! Contexto da matilha:\n${ragContext}\n\nSobre "${trimmed}": configure OPENAI_API_KEY para respostas com IA, ou veja /tribunal e Versions.txt.`,
      aiPowered: false,
      ragUsed: true,
    };
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
          { role: "system", content: GUARD_DOG_RULES },
          {
            role: "user",
            content: `Dados do usuário:\n${ragContext}\n\nPergunta: ${trimmed}`,
          },
        ],
        max_tokens: 320,
      }),
    });
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return {
      answer: text?.slice(0, 900) ?? "Não consegui latir uma resposta agora.",
      aiPowered: true,
      ragUsed: true,
    };
  } catch {
    return {
      answer: "Auau… falha na toca. Tente de novo em instantes.",
      aiPowered: false,
      ragUsed: true,
    };
  }
}
