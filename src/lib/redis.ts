import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType | null> | null = null;

export function isRedisEnabled(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

export async function getRedis(): Promise<RedisClientType | null> {
  if (!isRedisEnabled()) return null;
  if (client?.isOpen) return client;

  if (!connecting) {
    connecting = (async () => {
      try {
        const c = createClient({ url: process.env.REDIS_URL!.trim() });
        c.on("error", (err) => {
          console.warn("[redis]", err.message);
        });
        await c.connect();
        client = c as RedisClientType;
        return client;
      } catch (e) {
        console.warn("[redis] connect failed", e);
        client = null;
        return null;
      } finally {
        connecting = null;
      }
    })();
  }

  return connecting;
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson(
  key: string,
  value: unknown,
  ttlSec: number,
): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.setEx(key, ttlSec, JSON.stringify(value));
  } catch {
    /* cache miss on next read */
  }
}

export async function cacheDel(key: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    /* */
  }
}

export async function cacheDelPattern(prefix: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) await redis.del(keys);
  } catch {
    /* */
  }
}
