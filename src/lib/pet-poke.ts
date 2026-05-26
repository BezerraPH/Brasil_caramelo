import type { PetPokeAction } from "@/generated/prisma/enums";
import type { DogReputationLevel } from "@/generated/prisma/enums";

export type PetPokeDefinition = {
  action: PetPokeAction;
  emoji: string;
  label: string;
  /** Apenas para quem tem vibe Vira-Lata ou Caramelo (dominante ou voto próprio). */
  viralataOnly?: boolean;
};

export const PET_POKE_ACTIONS: PetPokeDefinition[] = [
  { action: "PAWS", emoji: "🤝", label: "Dar a pata" },
  { action: "PET_CARE", emoji: "👋", label: "Pedir carinho" },
  { action: "BARK", emoji: "🐕", label: "Latar para o portão" },
  { action: "CHEESE_BREAD", emoji: "🧀", label: "Oferecer pão de queijo" },
  {
    action: "SNIFF",
    emoji: "👃",
    label: "Dar um cheiro no rabo",
    viralataOnly: true,
  },
];

export const PET_POKE_BY_ACTION = Object.fromEntries(
  PET_POKE_ACTIONS.map((a) => [a.action, a]),
) as Record<PetPokeAction, PetPokeDefinition>;

export const PET_POKE_HAPPINESS_BONUS = 5;

export function canUseSniffPoke(level: DogReputationLevel | null | undefined): boolean {
  return level === "VIRALATA" || level === "CARAMELO";
}

export function buildPetPokeMessage(
  fromPetName: string,
  fromUserName: string,
  toPetName: string,
  action: PetPokeAction,
): string {
  const def = PET_POKE_BY_ACTION[action];
  switch (action) {
    case "PAWS":
      return `${fromPetName} de ${fromUserName} deu a pata para ${toPetName}! ${def.emoji}`;
    case "PET_CARE":
      return `${fromPetName} pediu carinho no quintal de ${toPetName}. ${def.emoji}`;
    case "BARK":
      return `O ${fromPetName} de ${fromUserName} latiu para o portão de ${toPetName}! ${def.emoji}`;
    case "CHEESE_BREAD":
      return `${fromPetName} ofereceu pão de queijo para ${toPetName}. ${def.emoji}`;
    case "SNIFF":
      return `${fromPetName} deu um cheiro no rabo do ${toPetName}. Clássico vira-lata! ${def.emoji}`;
    default:
      return `${fromUserName} interagiu com ${toPetName}. ${def.emoji}`;
  }
}
