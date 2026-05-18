import { PREMIUM_PERKS } from "./constants";

export const BASE_TREATS_PER_DAY = 10;

export function treatsPerDayForUser(isPremium: boolean): number {
  return BASE_TREATS_PER_DAY + (isPremium ? PREMIUM_PERKS.treatLimitBonus : 0);
}
