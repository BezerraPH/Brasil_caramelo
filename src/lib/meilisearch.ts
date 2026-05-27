/** Cliente HTTP Meilisearch (servidor) — opcional; SQL é fallback. */

export const MEILI_INDEX_USERS = "bc_users";
export const MEILI_INDEX_POSTS = "bc_posts";

function host(): string | null {
  const h = process.env.MEILISEARCH_HOST?.trim();
  return h ? h.replace(/\/$/, "") : null;
}

function apiKey(): string | null {
  return process.env.MEILISEARCH_MASTER_KEY?.trim() || null;
}

export function isMeilisearchEnabled(): boolean {
  return Boolean(host() && apiKey());
}

export type SearchEngine = "meilisearch" | "sql";

export async function meiliRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const base = host();
  const key = apiKey();
  if (!base || !key) return null;

  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[meilisearch]", res.status, path, text.slice(0, 200));
      return null;
    }
    if (res.status === 204) return {} as T;
    return (await res.json()) as T;
  } catch (e) {
    console.warn("[meilisearch] fetch failed", path, e);
    return null;
  }
}
