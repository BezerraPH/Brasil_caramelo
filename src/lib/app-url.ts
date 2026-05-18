/**
 * URL pública do app (links, PWA, notificações).
 * Em LAN: http://brasilcaramelo.com:3000 ou http://192.168.1.4:3000
 */
export function getAppUrl(): string {
  const fromEnv =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** Monta URL absoluta para um caminho interno. */
export function appPath(path: string): string {
  const base = getAppUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
