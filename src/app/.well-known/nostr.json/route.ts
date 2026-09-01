import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim().toLowerCase();

  const names: Record<string, string> = {};
  const relays: Record<string, string[]> = {};

  const defaultRelays = [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.nostr.band",
  ];

  try {
    if (name && name !== "_") {
      const user = await prisma.user.findFirst({
        where: { username: { equals: name, mode: "insensitive" } },
        select: { username: true, id: true },
      });
      if (user) {
        // Se o usuário não tiver chave Nostr customizada, geramos determinística baseada no ID ou hex
        const pubkeyHex = user.id.replace(/-/g, "").padEnd(64, "0").slice(0, 64);
        names[user.username.toLowerCase()] = pubkeyHex;
        relays[pubkeyHex] = defaultRelays;
      }
    } else {
      // Retorna os principais membros da matilha
      const users = await prisma.user.findMany({
        take: 20,
        select: { username: true, id: true },
      });
      for (const u of users) {
        const pubkeyHex = u.id.replace(/-/g, "").padEnd(64, "0").slice(0, 64);
        names[u.username.toLowerCase()] = pubkeyHex;
        relays[pubkeyHex] = defaultRelays;
      }
    }
  } catch {
    // fallback sem banco
  }

  return NextResponse.json(
    { names, relays },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    },
  );
}
