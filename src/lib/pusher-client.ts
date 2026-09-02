import Pusher from "pusher-js";

/** Opções do cliente Pusher — cloud (cluster) ou self-hosted (Soketi no seu servidor). */
export function createPusherClient(
  key: string,
  cluster: string,
): Pusher | null {
  if (!key?.trim()) return null;

  const isBrowser = typeof window !== "undefined";
  const isHttps = isBrowser && window.location.protocol === "https:";
  const envHost = process.env.NEXT_PUBLIC_PUSHER_HOST?.trim();
  const host = envHost || (isBrowser ? window.location.hostname : "");

  if (host) {
    const rawPort = process.env.NEXT_PUBLIC_PUSHER_PORT?.trim();
    const port = isHttps ? 443 : Number(rawPort || "6001");
    const useTls = isHttps || process.env.NEXT_PUBLIC_PUSHER_USE_TLS === "true";

    return new Pusher(key, {
      cluster: cluster || "mt1",
      authEndpoint: "/api/pusher/auth",
      wsHost: isBrowser && (envHost?.includes("192.168.") || envHost === "localhost") && isHttps ? window.location.hostname : host,
      wsPort: port,
      wssPort: port,
      forceTLS: useTls,
      enabledTransports: ["ws", "wss"],
      disableStats: true,
    });
  }

  if (!cluster?.trim()) return null;

  return new Pusher(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
  });
}

/** Canal global (rolezinho etc.) — sem auth privado. */
export function createPublicPusherClient(
  key: string,
  cluster: string,
): Pusher | null {
  if (!key?.trim()) return null;

  const isBrowser = typeof window !== "undefined";
  const isHttps = isBrowser && window.location.protocol === "https:";
  const envHost = process.env.NEXT_PUBLIC_PUSHER_HOST?.trim();
  const host = envHost || (isBrowser ? window.location.hostname : "");

  if (host) {
    const rawPort = process.env.NEXT_PUBLIC_PUSHER_PORT?.trim();
    const port = isHttps ? 443 : Number(rawPort || "6001");
    const useTls = isHttps || process.env.NEXT_PUBLIC_PUSHER_USE_TLS === "true";

    return new Pusher(key, {
      cluster: cluster || "mt1",
      wsHost: isBrowser && (envHost?.includes("192.168.") || envHost === "localhost") && isHttps ? window.location.hostname : host,
      wsPort: port,
      wssPort: port,
      forceTLS: useTls,
      enabledTransports: ["ws", "wss"],
      disableStats: true,
    });
  }

  if (!cluster?.trim()) return null;
  return new Pusher(key, { cluster });
}

export function isPusherClientConfigured(
  key?: string | null,
  cluster?: string | null,
): boolean {
  if (!key?.trim()) return false;
  if (process.env.NEXT_PUBLIC_PUSHER_HOST?.trim()) return true;
  return Boolean(cluster?.trim());
}
