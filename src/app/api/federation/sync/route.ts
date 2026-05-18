import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { signFederationPayload } from "@/lib/federation";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        errors.push(`${peer.name}: HTTP ${res.status}`);
        continue;
      }
      const data = (await res.json()) as { posts?: unknown[] };
      imported += data.posts?.length ?? 0;
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
    note: "v2.3: importação completa de posts federados em desenvolvimento.",
  });
}
