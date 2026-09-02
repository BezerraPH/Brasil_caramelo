// Rate Limiter com algoritmo Sliding Window em memória / Redis compatível

type RateLimitRecord = {
  timestamps: number[];
};

const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpeza automática a cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Obtém o IP do cliente a partir dos headers da requisição.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Gera uma chave padronizada de rate limit.
 */
export function rateLimitKey(userId: string | null, ip: string, scope?: string): string {
  return `${scope ?? "default"}:${userId ?? ip}`;
}

/**
 * Verifica se uma chave ultrapassou o limite permitido.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000,
  scope?: string,
): Promise<boolean> {
  const fullKey = scope ? `${scope}:${key}` : key;
  const now = Date.now();
  const record = rateLimitStore.get(fullKey) ?? { timestamps: [] };

  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    return false;
  }

  record.timestamps.push(now);
  rateLimitStore.set(fullKey, record);
  return true;
}
