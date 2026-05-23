import { NextResponse } from "next/server";
import { getVersionDisplay, RELEASE_STAGE } from "@/lib/app-version";
import { getStackHealth } from "@/lib/stack-health";

/** Dicas de conexão para o cliente (HTTPS, LiveKit, Pusher) — sem segredos. */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const livekit = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() ?? "";
  const pusherHost = process.env.NEXT_PUBLIC_PUSHER_HOST?.trim() ?? "";
  const pusherTls = process.env.NEXT_PUBLIC_PUSHER_USE_TLS === "true";

  const isTailscale = appUrl.includes(".ts.net");
  const isHttps = appUrl.startsWith("https://");

  return NextResponse.json({
    version: getVersionDisplay(),
    stage: RELEASE_STAGE,
    appUrl,
    secureRecommended: true,
    mode: isTailscale ? "tailscale" : isHttps ? "https-lan" : "http-lan",
    livekitConfigured: Boolean(livekit),
    pusherConfigured: Boolean(pusherHost),
    pusherTls,
    stack: getStackHealth(),
    hints: [
      isHttps || isTailscale
        ? null
        : "Use HTTPS para microfone, Latidos e chamadas no celular.",
      isTailscale
        ? "Modo Tailscale: mantenha o app Tailscale ligado no celular."
        : null,
      !isTailscale && isHttps
        ? "Modo LAN: instale o certificado mkcert no aparelho se o navegador avisar."
        : null,
    ].filter(Boolean),
  });
}
