import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createMercadoPagoPreference,
  createPremiumOrder,
} from "@/lib/premium-billing";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (user.isPremium) {
    return NextResponse.json(
      { error: "Você já é Pedigree." },
      { status: 400 },
    );
  }

  const amount =
    process.env.PEDIGREE_PRICE_BRL?.trim() ?? "19.90";
  const pixKey = process.env.PEDIGREE_PIX_KEY?.trim() ?? null;

  const created = await createPremiumOrder(user.id, amount);
  if (!created) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const { order, username } = created;

  let mercadoPago: { checkoutUrl: string | null } | null = null;
  const mp = await createMercadoPagoPreference(
    order.id,
    order.reference,
    amount,
    user.email,
  );
  if (mp?.checkoutUrl) mercadoPago = { checkoutUrl: mp.checkoutUrl };

  return NextResponse.json({
    orderId: order.id,
    reference: order.reference,
    amountBrl: amount,
    pixKey,
    username,
    provider: order.provider,
    instructions: pixKey
      ? `PIX de R$ ${amount} com a referência ${order.reference} na descrição (ou seu @${username}).`
      : "Use Mercado Pago abaixo ou um código Pedigree.",
    mercadoPago,
  });
}
