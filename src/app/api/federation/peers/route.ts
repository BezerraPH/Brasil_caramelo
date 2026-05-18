import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  listFederationPeers,
  normalizePeerUrl,
} from "@/lib/federation";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const peerSchema = z.object({
  name: z.string().min(2).max(40),
  baseUrl: z.string().url().max(200),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const peers = await listFederationPeers(user.id);
  return NextResponse.json({ peers });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const count = await prisma.federationPeer.count({
    where: { ownerId: user.id },
  });
  if (count >= 5) {
    return NextResponse.json(
      { error: "Máximo de 5 peers na matilha LAN." },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { name, baseUrl } = peerSchema.parse(body);
    const url = normalizePeerUrl(baseUrl);
    const secret = randomBytes(24).toString("hex");

    const peer = await prisma.federationPeer.create({
      data: {
        ownerId: user.id,
        name,
        baseUrl: url,
        secret,
      },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        secret: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ peer });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id obrigatório." }, { status: 400 });
  }

  await prisma.federationPeer.deleteMany({
    where: { id, ownerId: user.id },
  });

  return NextResponse.json({ ok: true });
}
