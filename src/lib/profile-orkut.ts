import type { RelationshipStatus } from "@/generated/prisma/enums";

export const RELATIONSHIP_LABELS: Record<RelationshipStatus, string> = {
  SINGLE: "Solteiro(a)",
  IN_RELATIONSHIP: "Namorando",
  ENGAGED: "Noivo(a)",
  MARRIED: "Casado(a)",
  COMPLICATED: "É complicado",
  NOT_SAYING: "Prefiro não dizer",
};

export function computeAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export function formatBirthday(birthDate: Date): string {
  return birthDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

export function formatLocationDisplay(
  city: string | null,
  area: string | null,
  show: boolean,
): string | null {
  if (!show || !city?.trim()) return null;
  const c = city.trim();
  const a = area?.trim();
  return a ? `${a}, ${c}` : c;
}
