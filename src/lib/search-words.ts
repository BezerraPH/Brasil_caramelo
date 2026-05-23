/** Tokeniza consulta de busca (remove # inicial, palavras ≥ 2 chars). */
export function tokenizeSearchQuery(raw: string): string[] {
  const cleaned = raw.trim().replace(/^#/, "").toLowerCase();
  if (!cleaned) return [];
  return cleaned
    .split(/\s+/)
    .map((w) => w.replace(/^@/, ""))
    .filter((w) => w.length >= 2);
}
