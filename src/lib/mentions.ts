const MENTION_RE = /@([a-z0-9_]{3,30})/gi;

/** Usernames mencionados (sem @), únicos e em minúsculas. */
export function extractMentions(text: string): string[] {
  const seen = new Set<string>();
  for (const m of text.matchAll(MENTION_RE)) {
    const u = m[1]?.toLowerCase();
    if (u) seen.add(u);
  }
  return [...seen];
}

export const CONTENT_TOKEN_SPLIT = /(#[\w\u00C0-\u017F]+|@[a-z0-9_]{3,30})/gi;
