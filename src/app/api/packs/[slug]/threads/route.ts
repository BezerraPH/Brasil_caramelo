import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { startOfWeekUtc } from "@/lib/pack-mystery";
import { prisma } from "@/lib/prisma";
import { packThreadSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const pack = await prisma.pack.findUnique({ where: { slug } });
  if (!pack) {
    return NextResponse.json({ error: "Matilha não encontrada." }, { status: 404 });
  }

  const member = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: pack.id, userId: user.id } },
  });
  if (!member) {
    return NextResponse.json(
      { error: "Entre na Matilha antes de criar tópicos." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { title, content, anonymous } = packThreadSchema.parse(body);

    if (anonymous) {
      const weekStart = startOfWeekUtc();
      const recent = await prisma.thread.count({
        where: {
          packId: pack.id,
          authorId: user.id,
          anonymous: true,
          createdAt: { gte: weekStart },
        },
      });
      if (recent >= 1) {
        return NextResponse.json(
          { error: "Só 1 fofoca anônima por semana nesta Matilha." },
          { status: 429 },
        );
      }
    }

    const thread = await prisma.thread.create({
      data: {
        packId: pack.id,
        title: title.trim(),
        authorId: user.id,
        anonymous: Boolean(anonymous),
        replies: {
          create: {
            authorId: user.id,
            content: content.trim(),
          },
        },
      },
    });

    return NextResponse.json({ ok: true, threadId: thread.id });
  } catch {
    return NextResponse.json({ error: "Tópico inválido." }, { status: 400 });
  }
}
