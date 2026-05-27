import { NextResponse } from "next/server";
import { fulfillPremiumOrder } from "@/lib/premium-billing";

/** Webhook Mercado Pago (payment approved). */
export async function POST(request: Request) {
  const secret = process.env.PREMIUM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const token = request.headers.get("x-webhook-secret");
    if (token !== secret) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const data = payload as {
    type?: string;
    action?: string;
    data?: { id?: string };
  };

  const paymentId = data.data?.id;
  if (!paymentId || !process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()) {
    return NextResponse.json({ received: true });
  }

  const payRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN.trim()}`,
      },
    },
  );

  if (!payRes.ok) {
    return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  }

  const payment = (await payRes.json()) as {
    status?: string;
    external_reference?: string;
  };

  if (payment.status !== "approved") {
    return NextResponse.json({ received: true, status: payment.status });
  }

  if (!payment.external_reference) {
    return NextResponse.json({ error: "Sem external_reference." }, { status: 400 });
  }

  const result = await fulfillPremiumOrder({
    reference: payment.external_reference,
    externalId: String(paymentId),
  });

  return NextResponse.json({
    ok: result.ok,
    username: result.ok ? result.username : undefined,
  });
}
