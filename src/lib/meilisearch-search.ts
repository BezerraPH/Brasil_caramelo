import {
  isMeilisearchEnabled,
  meiliRequest,
  MEILI_INDEX_POSTS,
  MEILI_INDEX_USERS,
  type SearchEngine,
} from "@/lib/meilisearch";

type MeiliHit<T> = { hits: T[] };

export async function meiliSearchUsers(
  q: string,
  excludeUserId: string,
  limit = 20,
): Promise<{ ids: string[]; engine: SearchEngine } | null> {
  if (!isMeilisearchEnabled()) return null;
  const usernameQ = q.startsWith("@") ? q.slice(1) : q;
  const result = await meiliRequest<
    MeiliHit<{ id: string }>
  >(`/indexes/${MEILI_INDEX_USERS}/search`, {
    method: "POST",
    body: JSON.stringify({
      q: usernameQ,
      limit,
      filter: "shadowbanned = false",
    }),
  });
  if (!result?.hits) return null;
  return {
    ids: result.hits.map((h) => h.id).filter((id) => id !== excludeUserId),
    engine: "meilisearch",
  };
}

export async function meiliSearchPosts(
  q: string,
  limit = 30,
): Promise<{ ids: string[]; engine: SearchEngine } | null> {
  if (!isMeilisearchEnabled()) return null;
  const result = await meiliRequest<MeiliHit<{ id: string }>>(
    `/indexes/${MEILI_INDEX_POSTS}/search`,
    {
      method: "POST",
      body: JSON.stringify({
        q,
        limit,
        filter:
          "tribunalHidden = false AND communityLevel IS NULL AND authorShadowbanned = false",
        sort: ["createdAt:desc"],
      }),
    },
  );
  if (!result?.hits) return null;
  return {
    ids: result.hits.map((h) => h.id),
    engine: "meilisearch",
  };
}

export async function meiliSearchPostsByTag(
  tag: string,
  limit = 30,
): Promise<{ ids: string[]; engine: SearchEngine } | null> {
  if (!isMeilisearchEnabled()) return null;
  const result = await meiliRequest<MeiliHit<{ id: string }>>(
    `/indexes/${MEILI_INDEX_POSTS}/search`,
    {
      method: "POST",
      body: JSON.stringify({
        q: tag,
        limit,
        filter:
          "tribunalHidden = false AND communityLevel IS NULL AND authorShadowbanned = false",
        attributesToSearchOn: ["tags"],
        sort: ["createdAt:desc"],
      }),
    },
  );
  if (!result?.hits) return null;
  return {
    ids: result.hits.map((h) => h.id),
    engine: "meilisearch",
  };
}

export async function meiliSuggestTags(
  prefix: string,
  limit = 8,
): Promise<{ tag: string }[] | null> {
  if (!isMeilisearchEnabled() || prefix.length < 1) return null;
  const result = await meiliRequest<MeiliHit<{ tags: string[] }>>(
    `/indexes/${MEILI_INDEX_POSTS}/search`,
    {
      method: "POST",
      body: JSON.stringify({
        q: prefix,
        limit: 20,
        attributesToSearchOn: ["tags"],
        filter:
          "tribunalHidden = false AND communityLevel IS NULL AND authorShadowbanned = false",
      }),
    },
  );
  if (!result?.hits) return null;
  const seen = new Set<string>();
  const out: { tag: string }[] = [];
  for (const hit of result.hits) {
    for (const t of hit.tags ?? []) {
      if (!t.startsWith(prefix) || seen.has(t)) continue;
      seen.add(t);
      out.push({ tag: t });
      if (out.length >= limit) return out;
    }
  }
  return out;
}
