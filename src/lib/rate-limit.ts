import { LRUCache } from "lru-cache";
import { getRedis } from "@/lib/redis";

type Bucket = { count: number };

const caches = new Map<string, LRUCache<string, Bucket>>();

function getMemoryCache(name: string, windowMs: number) {
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

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowMs: number,
  namespace: string,
): boolean {
  const cache = getMemoryCache(`${namespace}:${windowMs}`, windowMs);
  const bucket = cache.get(key);
  if (!bucket) {
    cache.set(key, { count: 1 });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Rate limit distribuído (Redis) com fallback LRU em memória.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  namespace = "default",
): Promise<boolean> {
  const redis = await getRedis();
  if (redis) {
    try {
      const rk = `rl:${namespace}:${key}`;
      const count = await redis.incr(rk);
      if (count === 1) {
        await redis.expire(rk, Math.max(1, Math.ceil(windowMs / 1000)));
      }
      return count <= limit;
    } catch {
      /* fallback memory */
    }
  }
  return checkRateLimitMemory(key, limit, windowMs, namespace);
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
