import { NextResponse } from "next/server";

/** Webhook para gateway de pagamento (Mercado Pago, Stripe, etc.) — alpha stub. */
export async function POST(request: Request) {
  const secret = process.env.PREMIUM_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook não configurado." },
      { status: 503 },
    );
  }

  const token = request.headers.get("x-webhook-secret");
  if (token !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Confirme pagamento manualmente em alpha (PREMIUM_CODE / admin).",
  });
}
