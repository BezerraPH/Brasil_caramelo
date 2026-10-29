import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const postId = typeof body?.postId === "string" ? body.postId.trim() : null;

    // Reseta qualquer outro post previamente fixado deste autor
    await prisma.post.updateMany({
      where: { authorId: user.id, boostPriority: 999 },
      data: { boostPriority: 0 },
    });

    if (postId) {
      // Fixa um post já existente do usuário
      const existing = await prisma.post.findFirst({
        where: { id: postId, authorId: user.id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Post não encontrado para fixação." },
          { status: 404 }
        );
      }

      const updated = await prisma.post.update({
        where: { id: postId },
        data: { boostPriority: 999 },
      });

      return NextResponse.json({ ok: true, post: updated });
    }

    if (!content) {
      return NextResponse.json(
        { error: "Informe o texto do recado do dia ou um postId válido." },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "O recado do dia não pode exceder 500 caracteres." },
        { status: 400 }
      );
    }

    // Cria um novo post já fixado como Recado do Dia
    const newPinned = await prisma.post.create({
      data: {
        authorId: user.id,
        content,
        boostPriority: 999,
      },
    });

    return NextResponse.json({ ok: true, post: newPinned });
  } catch (error: unknown) {
    console.error("[PIN_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao fixar recado do dia no perfil." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    await prisma.post.updateMany({
      where: { authorId: user.id, boostPriority: 999 },
      data: { boostPriority: 0 },
    });

    return NextResponse.json({ ok: true, message: "Recado do dia desafixado com sucesso." });
  } catch (error: unknown) {
    console.error("[UNPIN_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao desafixar recado." },
      { status: 500 }
    );
  }
}
