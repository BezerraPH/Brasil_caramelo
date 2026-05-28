import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isMatilhaAdmin } from "@/lib/matilha-admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!isMatilhaAdmin(user, request)) {
    return NextResponse.json({ error: "Acesso restrito à matilha." }, { status: 403 });
  }

  const orders = await prisma.premiumOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { username: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      amountBrl: o.amountBrl,
      provider: o.provider,
      status: o.status,
      paidAt: o.paidAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
      user: o.user,
    })),
  });
}
