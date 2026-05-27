/** Desafio de Tópico do Dia — zero DB, determinístico. */
export const DAILY_TOPIC_CHALLENGES = [
  {
    question: "Qual a melhor comida de avó que você conhece?",
    packSlug: "culinaria-da-matilha",
    packName: "Culinária da Matilha",
  },
  {
    question: "Qual foi o pior despertador que você já ouviu?",
    packSlug: "odeio-acordar-cedo",
    packName: "Eu Odeio Acordar Cedo",
  },
  {
    question: "Você aceita amizade sem deixar scrap?",
    packSlug: "so-add-com-scrap",
    packName: "Só add com scrap",
  },
  {
    question: "Café ou pix — o que salva mais a amizade?",
    packSlug: "tamo-junto-cafe-pix",
    packName: "Tamo junto, aceito café e pix",
  },
  {
    question: "Conte uma fofoca leve da sua matilha (sem nomes!).",
    packSlug: "tamo-junto-cafe-pix",
    packName: "Tamo junto, aceito café e pix",
  },
  {
    question: "Qual bairro de Recife (ou sua cidade) é subestimado?",
    packSlug: "tamo-junto-cafe-pix",
    packName: "Tamo junto, aceito café e pix",
  },
  {
    question: "Seu pet virtual comeria pão de queijo de manhã?",
    packSlug: "culinaria-da-matilha",
    packName: "Culinária da Matilha",
  },
] as const;

export type DailyTopicChallenge = (typeof DAILY_TOPIC_CHALLENGES)[number];

export function getDailyTopicChallenge(): DailyTopicChallenge {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return DAILY_TOPIC_CHALLENGES[dayOfYear % DAILY_TOPIC_CHALLENGES.length]!;
}
