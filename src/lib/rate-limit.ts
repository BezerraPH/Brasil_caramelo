import { LRUCache } from "lru-cache";

type Bucket = { count: number };

const caches = new Map<string, LRUCache<string, Bucket>>();

function getCache(name: string, windowMs: number) {
  let cache = caches.get(name);
  if (!cache) {
    cache = new LRUCache<string, Bucket>({
      max: 10_000,
      ttl: windowMs,
    });
    caches.set(name, cache);
  }
  return cache;
}

/**
 * Retorna true se a requisição está dentro do limite.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  namespace = "default",
): boolean {
  const cache = getCache(`${namespace}:${windowMs}`, windowMs);
  const bucket = cache.get(key);
  if (!bucket) {
    cache.set(key, { count: 1 });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function rateLimitKey(
  userId: string | null,
  ip: string | null,
): string {
  return userId ? `u:${userId}` : `ip:${ip ?? "unknown"}`;
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}
