import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { friendshipDegreeSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.degree !== undefined) {
    try {
      const { degree } = friendshipDegreeSchema.parse(body);
      const friendship = await prisma.friendship.findUnique({ where: { id } });
      if (
        !friendship ||
        friendship.status !== "ACCEPTED" ||
        (friendship.requesterId !== user.id && friendship.addresseeId !== user.id)
      ) {
        return NextResponse.json({ error: "Amizade não encontrada." }, { status: 404 });
      }

      const data =
        friendship.requesterId === user.id
          ? { requesterDegree: degree }
          : { addresseeDegree: degree };

      const updated = await prisma.friendship.update({
        where: { id },
        data,
      });

      return NextResponse.json({
        ok: true,
        degree:
          updated.requesterId === user.id
            ? updated.requesterDegree
            : updated.addresseeDegree,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json(
          { error: validationMessage(error) },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: "Grau inválido." }, { status: 400 });
    }
  }

  const action = body.action as "accept" | "reject";

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship || friendship.addresseeId !== user.id) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (action === "accept") {
    const updated = await prisma.friendship.update({
      where: { id },
      data: { status: "ACCEPTED" },
      include: { requester: { select: { name: true } } },
    });
    const me = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });
    await createNotification(
      friendship.requesterId,
      "FRIEND_ACCEPTED",
      `${me?.name ?? "Alguém"} aceitou seu pedido de amizade!`,
      "/amigos",
    );
    void updated;
    return NextResponse.json({ ok: true, status: "ACCEPTED" });
  }

  if (action === "reject") {
    await prisma.friendship.delete({ where: { id } });
    return NextResponse.json({ ok: true, status: "REJECTED" });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
