import { buildGuardDogRagContext } from "./guard-dog-context";
import { askOllama } from "./ollama";
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

export type GuardDogProvider = "ollama" | "openai" | "local";

export type GuardDogResult = {
  answer: string;
  aiPowered: boolean;
  ragUsed: boolean;
  provider: GuardDogProvider;
};

function localGuardDogAnswer(question: string, ragContext: string): string {
  const q = question.toLowerCase();
  const intro = "Auau! Com base na sua matilha:\n\n";
  const ctx = ragContext.split("\n").slice(0, 4).join("\n");

  if (q.includes("tribunal") || q.includes("denúnc") || q.includes("denunc")) {
    return `${intro}${ctx}\n\nRecados com 3+ denúncias vão ao Tribunal (/tribunal). Jurados Border Collie e Poodle votam; pareceres ficam no caso.`;
  }
  if (q.includes("impulsion") || q.includes("boost") || q.includes("moeda")) {
    return `${intro}${ctx}\n\nImpulsionar custa ${BOOST_COST_COINS} CarameloCoins por 2h. Cuide do pet e participe de eventos para ganhar moedas.`;
  }
  if (q.includes("pet") || q.includes("cachorro") || q.includes("dna")) {
    return `${intro}${ctx}\n\nSeu pet está em /cachorro — cruzamento DNA com amigos, buscar na matilha e loja de cosméticos.`;
  }
  if (q.includes("latido") || q.includes("áudio") || q.includes("audio")) {
    return `${intro}Salas ao vivo em /latidos (LiveKit). Configure NEXT_PUBLIC_LIVEKIT_URL no servidor.`;
  }

  return `${intro}${ctx}\n\nSobre "${question.slice(0, 80)}": veja /feed, /tribunal, /cachorro e /explorar. Configure OLLAMA_BASE_URL ou OPENAI_API_KEY no servidor para respostas com IA.`;
}

export async function askGuardDog(
  userId: string,
  question: string,
): Promise<GuardDogResult> {
  const trimmed = question.trim().slice(0, 500);
  if (!trimmed) {
    return {
      answer: "Latido? Escreva sua pergunta para o Cão de Guarda.",
      aiPowered: false,
      ragUsed: false,
      provider: "local",
    };
  }

  const ragContext = await buildGuardDogRagContext(userId);
  const messages = [
    { role: "system" as const, content: GUARD_DOG_RULES },
    {
      role: "user" as const,
      content: `Dados do usuário:\n${ragContext}\n\nPergunta: ${trimmed}`,
    },
  ];

  const ollamaAnswer = await askOllama(messages);
  if (ollamaAnswer) {
    return {
      answer: ollamaAnswer,
      aiPowered: true,
      ragUsed: true,
      provider: "ollama",
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 320,
        }),
      });
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) {
        return {
          answer: text.slice(0, 900),
          aiPowered: true,
          ragUsed: true,
          provider: "openai",
        };
      }
    } catch {
      /* fallback local */
    }
  }

  return {
    answer: localGuardDogAnswer(trimmed, ragContext),
    aiPowered: false,
    ragUsed: true,
    provider: "local",
  };
}
