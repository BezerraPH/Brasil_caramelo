import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isMatilhaAdmin } from "@/lib/matilha-admin";
import { fulfillPremiumOrder } from "@/lib/premium-billing";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!isMatilhaAdmin(user, request)) {
    return NextResponse.json({ error: "Acesso restrito à matilha." }, { status: 403 });
  }

  const { orderId } = await context.params;
  const order = await prisma.premiumOrder.findUnique({
    where: { id: orderId },
    select: { reference: true, status: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
  if (order.status === "PAID") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const result = await fulfillPremiumOrder({ reference: order.reference });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    username: result.username,
    reference: result.reference,
  });
}
