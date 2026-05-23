import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const offspring = await prisma.petOffspring.findUnique({ where: { id } });
  if (!offspring || offspring.ownerId !== user.id) {
    return NextResponse.json({ error: "Filhote não encontrado." }, { status: 404 });
  }
  if (offspring.adoptedAt) {
    return NextResponse.json(
      { error: "Este filhote já teve o DNA aplicado." },
      { status: 400 },
    );
  }

  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) {
    return NextResponse.json({ error: "Crie um pet em /cachorro primeiro." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.pet.update({
      where: { id: pet.id },
      data: {
        color: offspring.color,
        name: offspring.name.slice(0, 24),
      },
    }),
    prisma.petOffspring.update({
      where: { id: offspring.id },
      data: { adoptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    color: offspring.color,
    name: offspring.name,
  });
}
