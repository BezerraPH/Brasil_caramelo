/** Extrai hashtags de recados para índice de busca. */
export function extractHashtags(content: string): string[] {
  const matches = content.match(/#[\w\u00C0-\u024F]+/gi);
  if (!matches) return [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}
