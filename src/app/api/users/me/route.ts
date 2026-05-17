import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    if (data.username && data.username !== user.username) {
      const taken = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (taken) {
        return NextResponse.json(
          { error: "Este nome de usuário já está em uso." },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        bio: data.bio ?? null,
        ...(data.username ? { username: data.username } : {}),
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        email: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}
