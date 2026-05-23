import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { REPUTATION_BY_LEVEL } from "@/lib/constants";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { reputationSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const receivedVotes = await prisma.reputation.count({
    where: { toUserId: user.id },
  });

  return NextResponse.json({ ok: true, receivedVotes });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 30, 60_000, "reputation")) {
    return NextResponse.json(
      { error: "Muitos votos de personalidade. Aguarde um momento." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { toUserId, level } = reputationSchema.parse(body);

    if (toUserId === user.id) {
      return NextResponse.json(
        { error: "Você não pode avaliar a si mesmo." },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({ where: { id: toUserId } });
    if (!target) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    await prisma.reputation.upsert({
      where: {
        fromUserId_toUserId: { fromUserId: user.id, toUserId },
      },
      create: { fromUserId: user.id, toUserId, level },
      update: { level },
    });

    const personality = REPUTATION_BY_LEVEL[level];
    await createNotification(
      toUserId,
      "REPUTATION_VOTE",
      `${user.name} votou em você como ${personality.breed} ${personality.emoji}`,
      `/perfil/${target.username}`,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Avaliação inválida." }, { status: 400 });
  }
}
