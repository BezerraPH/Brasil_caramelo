import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { probeFederationPeer } from "@/lib/federation-probe";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const peer = await prisma.federationPeer.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!peer) {
    return NextResponse.json({ error: "Peer não encontrado." }, { status: 404 });
  }

  const result = await probeFederationPeer(peer.baseUrl, peer.networkType);
  await prisma.federationPeer.update({
    where: { id: peer.id },
    data: {
      lastProbeAt: new Date(),
      lastProbeOk: result.ok,
    },
  });

  return NextResponse.json({ peerId: peer.id, ...result });
}
