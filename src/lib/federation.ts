import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

export function signFederationPayload(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyFederationSignature(
  secret: string,
  body: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const expected = signFederationPayload(secret, body);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function normalizePeerUrl(url: string): string {
  const u = url.trim().replace(/\/+$/, "");
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    throw new Error("URL deve começar com http:// ou https://");
  }
  return u;
}

export async function listFederationPeers(ownerId: string) {
  return prisma.federationPeer.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      lastSyncAt: true,
      createdAt: true,
    },
  });
}
