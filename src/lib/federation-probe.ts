export type FederationNetworkType = "lan" | "tailnet";

export function inferNetworkType(baseUrl: string): FederationNetworkType {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    if (host.endsWith(".ts.net") || host.includes(".tail")) {
      return "tailnet";
    }
  } catch {
    /* ignore */
  }
  return "lan";
}

export function federationSyncTimeoutMs(networkType: string): number {
  return networkType === "tailnet" ? 20_000 : 8_000;
}

export type PeerProbeResult = {
  ok: boolean;
  status: number | null;
  latencyMs: number;
  storage?: string;
  version?: string;
  error?: string;
};

/** Testa se o peer remoto responde (health). */
export async function probeFederationPeer(
  baseUrl: string,
  networkType: string,
): Promise<PeerProbeResult> {
  const started = Date.now();
  const timeout = federationSyncTimeoutMs(networkType);
  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeout),
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    let version: string | undefined;
    let storage: string | undefined;
    if (res.ok) {
      try {
        const data = (await res.json()) as {
          version?: string;
          storage?: string;
        };
        version = data.version;
        storage = data.storage;
      } catch {
        /* body opcional */
      }
    }
    return {
      ok: res.ok,
      status: res.status,
      latencyMs,
      version,
      storage,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      ok: false,
      status: null,
      latencyMs: Date.now() - started,
      error: e instanceof Error ? e.message : "offline",
    };
  }
}
