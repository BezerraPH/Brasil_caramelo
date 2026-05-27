const MYSTERY_NAME = "Um Caramelo Misterioso";

export function mysteryAuthorDisplay(anonymous: boolean, realName: string): string {
  return anonymous ? MYSTERY_NAME : realName;
}

export function startOfWeekUtc(d = new Date()): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
