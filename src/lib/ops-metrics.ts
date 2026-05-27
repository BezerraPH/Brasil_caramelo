/** Métricas operacionais em memória (R-OPS-03) — consulta via /api/ops/metrics. */

export type OpsEventRecord = {
  type: string;
  detail: string | null;
  at: string;
  userId?: string | null;
};

const MAX_EVENTS = 150;
const events: OpsEventRecord[] = [];
const counters = new Map<string, number>();

export function recordOpsEvent(
  type: string,
  detail?: string | null,
  userId?: string | null,
): void {
  const key = type.trim() || "unknown";
  counters.set(key, (counters.get(key) ?? 0) + 1);
  events.unshift({
    type: key,
    detail: detail?.slice(0, 500) ?? null,
    at: new Date().toISOString(),
    userId: userId ?? null,
  });
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
}

export function getOpsSnapshot(): {
  counters: Record<string, number>;
  recentEvents: OpsEventRecord[];
} {
  return {
    counters: Object.fromEntries(counters.entries()),
    recentEvents: [...events],
  };
}

export function resetOpsMetrics(): void {
  counters.clear();
  events.length = 0;
}
