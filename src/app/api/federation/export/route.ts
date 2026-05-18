import { NextResponse } from "next/server";
import { verifyFederationSignature } from "@/lib/federation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const bodyText = await request.text();
  let parsed: { since?: string };
  try {
    parsed = JSON.parse(bodyText) as { since?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const sig = request.headers.get("x-federation-signature");
  const peerId = request.headers.get("x-federation-peer-id");
  const globalSecret = process.env.FEDERATION_EXPORT_SECRET?.trim();

  let authorized = Boolean(
    globalSecret && verifyFederationSignature(globalSecret, bodyText, sig),
  );

  if (!authorized && peerId) {
    const peer = await prisma.federationPeer.findUnique({
      where: { id: peerId },
    });
    if (peer && verifyFederationSignature(peer.secret, bodyText, sig)) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  const since = parsed.since ? new Date(parsed.since) : new Date(0);

  const posts = await prisma.post.findMany({
    where: {
      communityLevel: { not: null },
      createdAt: { gt: since },
      author: { shadowbanned: false },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      content: true,
      communityLevel: true,
      createdAt: true,
      author: { select: { username: true, name: true } },
    },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      content: p.content.slice(0, 500),
      communityLevel: p.communityLevel,
      createdAt: p.createdAt.toISOString(),
      author: p.author,
    })),
  });
}
