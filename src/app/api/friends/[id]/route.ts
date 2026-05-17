import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

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
