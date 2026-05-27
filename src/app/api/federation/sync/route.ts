import { NextResponse } from "next/server";
import {
  importPostsFromPeer,
  type ExportedFederatedPost,
} from "@/lib/federation-import";
import { unlockAchievement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { signFederationPayload } from "@/lib/federation";
import { federationSyncTimeoutMs } from "@/lib/federation-probe";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!(await checkRateLimit(key, 4, 60_000, "federation-sync"))) {
    return NextResponse.json(
      { error: "Aguarde antes de sincronizar de novo." },
      { status: 429 },
    );
  }

  const peers = await prisma.federationPeer.findMany({
    where: { ownerId: user.id },
  });

  let imported = 0;
  const errors: string[] = [];

  for (const peer of peers) {
    try {
      const body = JSON.stringify({ since: peer.lastSyncAt?.toISOString() });
      const exportSecret =
        process.env.FEDERATION_EXPORT_SECRET?.trim() || peer.secret;
      const sig = signFederationPayload(exportSecret, body);
      const res = await fetch(`${peer.baseUrl}/api/federation/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Federation-Signature": sig,
          "X-Federation-Peer-Id": peer.id,
        },
        body,
        signal: AbortSignal.timeout(
          federationSyncTimeoutMs(peer.networkType),
        ),
      });
      if (!res.ok) {
        errors.push(`${peer.name}: HTTP ${res.status}`);
        continue;
      }
      const data = (await res.json()) as { posts?: ExportedFederatedPost[] };
      const count = await importPostsFromPeer(
        peer.id,
        data.posts ?? [],
      );
      imported += count;
      await prisma.federationPeer.update({
        where: { id: peer.id },
        data: { lastSyncAt: new Date() },
      });
    } catch {
      errors.push(`${peer.name}: offline`);
    }
  }

  return NextResponse.json({
    peers: peers.length,
    imported,
    errors,
    ...(imported > 0 ? { achievement: await unlockAchievement(user.id, "FEDERATION_SYNC") } : {}),
  });
}
