import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reputationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Avaliação inválida." }, { status: 400 });
  }
}
