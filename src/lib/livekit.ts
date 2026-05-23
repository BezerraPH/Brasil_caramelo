import { AccessToken } from "livekit-server-sdk";

export function getLiveKitRoomName(casinhaSlug: string): string {
  return `bc-latidos-${casinhaSlug}`;
}

export function isLiveKitConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() &&
      process.env.LIVEKIT_API_KEY?.trim() &&
      process.env.LIVEKIT_API_SECRET?.trim(),
  );
}

export async function createLiveKitToken(
  userId: string,
  userName: string,
  roomName: string,
): Promise<{ token: string; url: string }> {
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL!.trim();
  const apiKey = process.env.LIVEKIT_API_KEY!.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET!.trim();

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: userName,
    ttl: "2h",
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();
  return { token, url };
}
