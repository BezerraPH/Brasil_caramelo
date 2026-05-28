import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { getCommunityForModeration } from "@/lib/communities";
import { prisma } from "@/lib/prisma";
import { communityThreadModerationSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ slug: string; threadId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug, threadId } = await context.params;
  const community = await getCommunityForModeration(slug, user.id);
  if (!community) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const thread = await prisma.communityThread.findFirst({
    where: { id: threadId, communityId: community.id },
  });
  if (!thread) {
    return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = communityThreadModerationSchema.parse(body);

    await prisma.communityThread.update({
      where: { id: threadId },
      data: {
        ...(data.pinned !== undefined ? { pinned: data.pinned } : {}),
        ...(data.archived !== undefined ? { archived: data.archived } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Moderação inválida." }, { status: 400 });
  }
}
