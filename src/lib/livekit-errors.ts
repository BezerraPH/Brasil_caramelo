import { DisconnectReason } from "livekit-client";

/** Mensagem amigável quando a sala LiveKit cai (reason 14 = timeout WebRTC). */
export function livekitDisconnectMessage(reason?: DisconnectReason): string {
  switch (reason) {
    case DisconnectReason.CONNECTION_TIMEOUT:
      return (
        "Timeout na mídia ao vivo (WebRTC). Libere UDP 50000–50100 no firewall do PC/celular " +
        "e confira se deploy/livekit/livekit.yaml tem node_ip igual ao BC_HOST."
      );
    case DisconnectReason.CLIENT_INITIATED:
      return "Você saiu da sala.";
    case DisconnectReason.DUPLICATE_IDENTITY:
      return "Esta conta já está conectada em outro dispositivo.";
    case DisconnectReason.SERVER_SHUTDOWN:
      return "Servidor LiveKit reiniciando — tente de novo em instantes.";
    case DisconnectReason.JOIN_FAILURE:
      return "Não foi possível entrar na sala. Verifique login e NEXT_PUBLIC_LIVEKIT_URL.";
    default:
      return reason
        ? `Conexão encerrada (código ${reason}).`
        : "Conexão encerrada.";
  }
}
