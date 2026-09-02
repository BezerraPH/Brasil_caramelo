import { SimplePool } from "nostr-tools";
import type { RelayInfo } from "./types";

export const DEFAULT_NOSTR_RELAYS: string[] = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://nostr.mom",
  "wss://relay.snort.social",
];

const LOCAL_STORAGE_RELAYS_KEY = "bc_nostr_relays";

// Cache em memória de latência e saúde dos relays
const relayHealthCache = new Map<string, { latencyMs: number; lastChecked: number; state: "connected" | "error" }>();

export function getSavedRelays(): string[] {
  if (typeof window === "undefined") return DEFAULT_NOSTR_RELAYS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RELAYS_KEY);
    if (!raw) return DEFAULT_NOSTR_RELAYS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return DEFAULT_NOSTR_RELAYS;
}

export function saveRelays(relays: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_RELAYS_KEY, JSON.stringify(relays));
  } catch {
    // ignore
  }
}

/**
 * Calcula o tempo de espera para reconexão usando Exponential Backoff com Jitter aleatório.
 * Previne "thundering herd" (tempestade de reconexões simultâneas).
 */
export function calculateBackoffDelay(attempt: number, baseMs = 1000, maxMs = 30000): number {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  const jitter = Math.random() * 0.3 * exp; // 30% jitter
  return Math.floor(exp + jitter);
}

// Singleton SimplePool para reutilização de WebSockets
let poolInstance: SimplePool | null = null;

export function getNostrPool(): SimplePool {
  if (!poolInstance) {
    poolInstance = new SimplePool();
  }
  return poolInstance;
}

/**
 * Testa a latência e conectividade com um relay WebSocket com cache de 30 segundos.
 */
export async function testRelayConnection(url: string, timeoutMs = 3000): Promise<RelayInfo> {
  const now = Date.now();
  const cached = relayHealthCache.get(url);
  if (cached && now - cached.lastChecked < 30000) {
    return {
      url,
      read: true,
      write: true,
      state: cached.state,
      latencyMs: cached.latencyMs,
    };
  }

  const start = Date.now();
  if (typeof window === "undefined") {
    return { url, read: true, write: true, state: "connected", latencyMs: 50 };
  }

  return new Promise((resolve) => {
    let ws: WebSocket | null = null;
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (ws) {
        ws.onopen = null;
        ws.onerror = null;
        try { ws.close(); } catch {}
      }
    };

    timer = setTimeout(() => {
      cleanup();
      relayHealthCache.set(url, { latencyMs: timeoutMs, lastChecked: Date.now(), state: "error" });
      resolve({ url, read: true, write: true, state: "error", latencyMs: timeoutMs });
    }, timeoutMs);

    try {
      ws = new WebSocket(url);
      ws.onopen = () => {
        const latencyMs = Date.now() - start;
        cleanup();
        relayHealthCache.set(url, { latencyMs, lastChecked: Date.now(), state: "connected" });
        resolve({ url, read: true, write: true, state: "connected", latencyMs });
      };
      ws.onerror = () => {
        cleanup();
        relayHealthCache.set(url, { latencyMs: timeoutMs, lastChecked: Date.now(), state: "error" });
        resolve({ url, read: true, write: true, state: "error", latencyMs: timeoutMs });
      };
    } catch {
      cleanup();
      relayHealthCache.set(url, { latencyMs: timeoutMs, lastChecked: Date.now(), state: "error" });
      resolve({ url, read: true, write: true, state: "error" });
    }
  });
}
