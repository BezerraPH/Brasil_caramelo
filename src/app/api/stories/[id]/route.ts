import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteMediaByUrl } from "@/lib/storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) {
    return NextResponse.json({ error: "Story não encontrado." }, { status: 404 });
  }
  if (story.userId !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await deleteMediaByUrl(story.mediaUrl);
  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
