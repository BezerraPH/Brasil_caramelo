import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { userInConversation } from "@/lib/chat";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: conversationId } = await context.params;
  if (!(await userInConversation(conversationId, user.id))) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  const now = new Date();
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      readAt: null,
    },
    data: { readAt: now },
  });

  return NextResponse.json({ ok: true });
}
