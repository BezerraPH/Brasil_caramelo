import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** Informações de checkout Pedigree (PIX manual e/ou Mercado Pago). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const pixKey = process.env.PEDIGREE_PIX_KEY?.trim();
  const amount = process.env.PEDIGREE_PRICE_BRL?.trim() ?? "19.90";
  const hasMp = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim());
  const hasWebhook = Boolean(process.env.PREMIUM_WEBHOOK_SECRET?.trim());

  return NextResponse.json({
    provider: hasMp ? "mercadopago" : pixKey ? "pix_manual" : "code_only",
    amountBrl: amount,
    pixKey: pixKey ?? null,
    hasMercadoPago: hasMp,
    hasWebhook,
    createOrderUrl: "/api/premium/orders",
    instructions: pixKey
      ? "Gere um pedido e use a referência BC-… na descrição do PIX. Confirmação via webhook ou admin."
      : hasMp
        ? "Pague com Mercado Pago abaixo."
        : "Use um código Pedigree em /premium.",
    webhookUrl: "/api/premium/webhook",
  });
}
