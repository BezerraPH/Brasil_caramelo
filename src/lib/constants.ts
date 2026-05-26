import type { DogReputationLevel } from "@/generated/prisma/enums";

export const DOG_REPUTATION_LEVELS = [
  "PITBULL",
  "HUSKY",
  "CARAMELO",
  "POODLE",
  "PINSCHER",
  "GOLDEN",
  "VIRALATA",
  "BORDER_COLLIE",
  "BASSET_HOUND",
  "CHOW_CHOW",
] as const;

export type ReputationPersonality = {
  level: DogReputationLevel;
  breed: string;
  emoji: string;
  about: string;
  vibe: string;
};

export const REPUTATION_PERSONALITIES: ReputationPersonality[] = [
  {
    level: "PITBULL",
    breed: "Pitbull",
    emoji: "🐕‍🦺",
    about: "Direto, intenso, não faz média.",
    vibe: "Digo a verdade doa a quem doer.",
  },
  {
    level: "HUSKY",
    breed: "Husky",
    emoji: "🐺",
    about: "Dramático, reclama de tudo, faz barulho.",
    vibe: "A vida é um caos e eu vou gritar sobre isso.",
  },
  {
    level: "CARAMELO",
    breed: "Caramelo",
    emoji: "🟤",
    about: "Raiz, humilde, gente boa, o sobrevivente.",
    vibe: "Tamo junto, aceito um café e um pix.",
  },
  {
    level: "POODLE",
    breed: "Poodle",
    emoji: "🐩",
    about: "Elegante, blasé, seletivo, classe alta.",
    vibe: "Meu feed é estético e eu não respondo DM.",
  },
  {
    level: "PINSCHER",
    breed: "Pinscher",
    emoji: "⚡",
    about: "220v, briguento, pavio curto, treteiro.",
    vibe: "Postou opinião errada? Vou comentar 10 vezes.",
  },
  {
    level: "GOLDEN",
    breed: "Golden",
    emoji: "🌟",
    about: "O biscoiteiro amigável, quer agradar todos.",
    vibe: "Amo vocês! Olhem como meu dia foi lindo!",
  },
  {
    level: "VIRALATA",
    breed: "Vira-lata",
    emoji: "🐕",
    about: "Desleixado (no bom sentido), low profile, relax.",
    vibe: "Posto foto tremida e não tô nem aí.",
  },
  {
    level: "BORDER_COLLIE",
    breed: "Border Collie",
    emoji: "🎯",
    about: "O produtivo, inteligente, posta tutorial de tudo.",
    vibe: "X dicas para você ser mais eficiente hoje.",
  },
  {
    level: "BASSET_HOUND",
    breed: "Basset Hound",
    emoji: "😴",
    about: "Preguiçoso, observador, só olha, não interage.",
    vibe: "Entrei, vi os stories e fui dormir.",
  },
  {
    level: "CHOW_CHOW",
    breed: "Chow Chow",
    emoji: "🧊",
    about: "Antissocial, fiel a poucos, difícil de conquistar.",
    vibe: "Não me segue que eu não te sigo.",
  },
];

export const REPUTATION_BY_LEVEL = Object.fromEntries(
  REPUTATION_PERSONALITIES.map((p) => [p.level, p]),
) as Record<DogReputationLevel, ReputationPersonality>;

export const REPUTATION_LEVELS = REPUTATION_PERSONALITIES;

export const VIEW_MODES = [
  { id: "FEED", label: "Feed", description: "Estilo comunidade (Orkut)", available: true },
  { id: "INSTA", label: "Insta", description: "Grade de fotos", available: true },
  { id: "REELS", label: "Cinelar", description: "Shorts com vídeo", available: true },
] as const;

export const PREMIUM_PERKS = {
  badge: "Pedigree",
  coinBonus: 1.5,
  treatLimitBonus: 5,
} as const;

/** Frases determinísticas — zero consulta ao banco (Sorte do Vira-Lata). */
export const SORTE_DO_DIA = [
  "Hoje é dia de dar oi pros amigos da matilha antes do café esfriar.",
  "Se alguém te cutucar, responda com um scrap carinhoso — o algoritmo não vai, mas a saudade sim.",
  "A sorte sorriu: você pode postar uma foto tremida e ninguém vai julgar. Vira-lata aprova.",
  "Momento ideal para aceitar aquele depoimento pendente e subir no topo do perfil de alguém.",
  "Latido no portão às 7h? Normal. Husky energy detectada no horizonte.",
  "Hoje o universo pede: compartilhe um meme e ganhe +1 amizade quase-real.",
  "Cuidado: três vizinhos vão visitar seu perfil. Deixe o quintal arrumado.",
  "O biscoito de hoje diz: pix cai, petisco aparece, felicidade +5.",
  "Pinscher mode: se alguém discordar de você online, respire fundo antes do 10º comentário.",
  "Golden retriever energy: mande mensagem pra alguém que você não fala há meses.",
  "Poodle chic: seu feed merece uma foto estética hoje. Sem pressão, mas com filtro.",
  "Border collie produtivo: faça uma lista e risca metade. O resto fica pro cachorro.",
  "Chow chow antissocial: tudo bem não responder DM. A matilha entende.",
  "Caramelo raiz: tamo junto, aceito café, pix e um abraço virtual.",
  "Basset hound preguiçoso: scroll leve, interação mínima, soneca máxima.",
  "Pitbull direto: diga o que pensa, mas com carinho. A matilha é família.",
  "Husky dramático: algo vai dar errado hoje. Faça barulho sobre isso com estilo.",
  "Vira-lata zen: poste sem revisar três vezes. Imperfeição é charme.",
  "Sorte especial: alguém vai te dar reputação de Caramelo. Merecido.",
  "Hoje é dia de entrar numa Matilha e criar o tópico mais aleatório possível.",
  "Aviso do oráculo canino: não confie em quem nunca deu petisco no seu perfil.",
  "Momento de dar a pata virtual a um amigo. PetPoke liberado.",
  "Se acordou cedo contra a vontade, você não está sozinho. A Matilha te vê.",
  "Frase do dia: quem visita perfil e não deixa scrap, leva latido na porta.",
  "Sorte boa: seu pet vai encontrar pão de queijo no caminho (metafórico).",
  "Dica: aceite visitas recíprocas no perfil e descubra quem anda bisbilhotando.",
  "Hoje o algoritmo é humano: converse nos tópicos, não só no feed infinito.",
  "Caramelo coins no bolso? Gaste metade em petisco, guarde metade pro rolezinho.",
  "Energia de domingo de manhã: devagar, mas presente na matilha.",
  "Última previsão: alguém vai te escrever um depoimento engraçado. Aceite ou responda.",
  "Março, abril, maio — em qualquer mês, a matilha é lar.",
  "Se a vida tá corrida, um scrap curto já conta como carinho.",
  "Oráculo cansado mas sincero: você é mais Caramelo do que imagina.",
  "Hoje evite drama… mentira, drama gera engajamento. Husky wins.",
  "Faça um elogio público. Reputação canina sobe nos dois lados.",
  "Sorte neutra: nem melhor nem pior. Ideal pra experimentar uma Matilha nova.",
  "O vento sopra scrap pra quem tem perfil aberto e coração de vira-lata.",
  "Lembrete: reciprocidade nas visitas. Quer saber quem passou? Mostre que você passa também.",
  "Biscoito quebrado diz: amizade verdadeira é quem te cutuca no PetPoke.",
  "Dia perfeito pra subir no topo do perfil de alguém com um depoimento aceito.",
  "Se nada der certo, pelo menos seu pet vai ficar +5 de felicidade. Confia.",
] as const;

export function getSorteDoDia(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return SORTE_DO_DIA[dayOfYear % SORTE_DO_DIA.length]!;
}
