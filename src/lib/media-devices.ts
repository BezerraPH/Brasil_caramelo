/** Utilitários para câmera/microfone — erros claros em celular (HTTP ≠ contexto seguro). */

export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function canUseMediaDevices(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export function mediaDevicesBlockedReason(): string | null {
  if (typeof window === "undefined") return null;
  if (window.isSecureContext) {
    if (!navigator.mediaDevices?.getUserMedia) {
      return "Seu navegador não suporta câmera/microfone.";
    }
    return null;
  }
  if (isMobileBrowser()) {
    return (
      "No celular, microfone e câmera exigem HTTPS. Acesse via https:// ou configure " +
      "nginx com certificado na LAN (veja CONFIGURACAO.md → HTTPS para celular)."
    );
  }
  return (
    "Microfone/câmera exigem contexto seguro (HTTPS ou localhost). " +
    "No PC em HTTP local, use Chrome com flag ou configure HTTPS."
  );
}

export async function requestUserMedia(
  opts: { video?: boolean; audio?: boolean } = { video: true, audio: true },
): Promise<MediaStream> {
  const blocked = mediaDevicesBlockedReason();
  if (blocked) throw new Error(blocked);

  const mobile = isMobileBrowser();
  const video = opts.video
    ? mobile
      ? { facingMode: "user" as const, width: { ideal: 640 }, height: { ideal: 480 } }
      : true
    : false;

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: opts.audio ?? true,
      video,
    });
  } catch (e) {
    if (opts.video && mobile) {
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch {
        /* cai no erro abaixo */
      }
    }
    const name = e instanceof DOMException ? e.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      throw new Error("Permissão negada — libere microfone/câmera nas configurações do celular.");
    }
    if (name === "NotFoundError") {
      throw new Error("Nenhum microfone ou câmera encontrado neste aparelho.");
    }
    throw new Error(e instanceof Error ? e.message : "Falha ao acessar mídia.");
  }
}

export function vibrateIncomingCall() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([200, 100, 200, 100, 400]);
  }
}
