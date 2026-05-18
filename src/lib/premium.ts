import { prisma } from "./prisma";

type PremiumFields = {
  id: string;
  isPremium: boolean;
  premiumUntil: Date | null;
};

/** Revoga Pedigree expirado e retorna flags efetivas. */
export async function resolvePremiumStatus<T extends PremiumFields>(
  user: T,
): Promise<T> {
  if (!user.isPremium) return user;
  if (!user.premiumUntil) return user;
  if (user.premiumUntil > new Date()) return user;

  await prisma.user.update({
    where: { id: user.id },
    data: { isPremium: false },
  });

  return { ...user, isPremium: false };
}
