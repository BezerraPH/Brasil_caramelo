// Utilitário de Cache em Memória com suporte a TTL e Invalidação

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Obtém ou calcula um valor em cache.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (entry && entry.expiresAt > now) {
    return entry.data;
  }

  const fresh = await fetchFn();
  memoryCache.set(key, {
    data: fresh,
    expiresAt: now + ttlSeconds * 1000,
  });

  return fresh;
}

/**
 * Invalida uma chave ou padrão de chaves do cache.
 */
export function invalidateCache(prefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}
