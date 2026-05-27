/** Reporta evento operacional do client (fire-and-forget). */
export function reportOpsClient(type: string, detail?: string): void {
  if (typeof window === "undefined") return;
  void fetch("/api/ops/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, detail: detail?.slice(0, 500) }),
    keepalive: true,
  }).catch(() => undefined);
}
