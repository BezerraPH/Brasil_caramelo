/** Extrai hashtags únicas de um texto (sem o #). */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#([\w\u00C0-\u017F]+)/gi);
  if (!matches) return [];
  const seen = new Set<string>();
  for (const m of matches) {
    seen.add(m.slice(1).toLowerCase());
  }
  return [...seen];
}

export const HASHTAG_SPLIT = /(#[\w\u00C0-\u017F]+)/gi;
