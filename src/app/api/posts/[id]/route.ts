import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteMediaByUrl } from "@/lib/storage";
import { editPostSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = editPostSchema.parse(await request.json());
    const updated = await prisma.post.update({
      where: { id },
      data: { content: body.content.trim() },
    });
    return NextResponse.json({ post: updated });
  } catch {
    return NextResponse.json({ error: "Texto inválido." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await Promise.all([
    deleteMediaByUrl(post.imageUrl),
    deleteMediaByUrl(post.videoUrl),
  ]);
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
