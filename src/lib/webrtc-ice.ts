/** ICE servers para WebRTC — só servidores que você configurar (coturn no seu Ubuntu). */
export function buildIceServers(): RTCConfiguration {
  const servers: RTCIceServer[] = [];

  const stunUrl = process.env.NEXT_PUBLIC_STUN_URL?.trim();
  if (stunUrl) {
    servers.push({ urls: stunUrl });
  }

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL?.trim();
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || undefined,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || undefined,
    });
  }

  return { iceServers: servers };
}
