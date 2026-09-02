import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { nip19 } from "nostr-tools";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { pubkey, profile } = body;

    if (!pubkey || typeof pubkey !== "string") {
      return NextResponse.json(
        { error: "Chave pública Nostr (pubkey/npub) é obrigatória." },
        { status: 400 }
      );
    }

    pubkey = pubkey.trim();

    // Se veio no formato npub1..., decodifica para hex
    let hexPubkey = pubkey;
    if (pubkey.startsWith("npub1")) {
      try {
        const decoded = nip19.decode(pubkey as `npub1${string}`);
        if (decoded.type === "npub") {
          hexPubkey = decoded.data as string;
        }
      } catch {
        return NextResponse.json(
          { error: "Formato de chave npub inválido." },
          { status: 400 }
        );
      }
    }

    if (hexPubkey.length !== 64 || !/^[0-9a-fA-F]+$/.test(hexPubkey)) {
      return NextResponse.json(
        { error: "Chave pública Nostr em formato hex inválida (deve ter 64 caracteres hexadecimais)." },
        { status: 400 }
      );
    }

    const deterministicEmail = `nostr_${hexPubkey.slice(0, 16).toLowerCase()}@brasilcaramelo.nostr`;
    const defaultUsername = `caramelo_${hexPubkey.slice(0, 8).toLowerCase()}`;

    // 1. Procura usuário existente
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: deterministicEmail },
          { username: defaultUsername }
        ]
      },
    });

    // 2. Se não existir, cria a conta anônima instantânea
    if (!user) {
      const name = profile?.name?.trim() || `Caramelo Nostr (${hexPubkey.slice(0, 6)}...)`;
      const bio = profile?.about?.trim() || "Cão soberano na rede descentralizada Nostr 🐕⚡";
      const avatarUrl = profile?.picture?.trim() || null;

      user = await prisma.user.create({
        data: {
          email: deterministicEmail,
          passwordHash: "NOSTR_AUTH_" + crypto.randomUUID(),
          name,
          username: defaultUsername,
          bio,
          avatarUrl,
          biscuitBalance: 50, // Bônus de boas-vindas da matilha
          pet: {
            create: {
              name: `Caramelinho`,
              color: "#C68642",
              hunger: 80,
              energy: 80,
              happiness: 80,
              coins: 50,
            }
          }
        },
      });
    }

    // 3. Cria sessão do usuário e define cookie seguro
    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      message: "Autenticação anônima via Nostr realizada com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("[NOSTR_LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Falha ao processar login anônimo via Nostr: " + (error?.message || "erro interno") },
      { status: 500 }
    );
  }
}
