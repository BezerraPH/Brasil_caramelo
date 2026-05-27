import { NextResponse } from "next/server";
import { z } from "zod";
import { fulfillPremiumOrder } from "@/lib/premium-billing";

const bodySchema = z.object({
  status: z.enum(["approved", "paid", "PAID", "APPROVED"]),
  reference: z.string().min(4).optional(),
  username: z.string().min(2).optional(),
  externalId: z.string().optional(),
});

/** Webhook para confirmar PIX / pagamento manual (n8n, script admin, etc.). */
export async function POST(request: Request) {
  const secret = process.env.PREMIUM_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "PREMIUM_WEBHOOK_SECRET não configurado." },
      { status: 503 },
    );
  }

  const token =
    request.headers.get("x-webhook-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (token !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    if (!body.reference && !body.username) {
      return NextResponse.json(
        { error: "Informe reference ou username." },
        { status: 400 },
      );
    }

    const result = await fulfillPremiumOrder({
      reference: body.reference,
      username: body.username,
      externalId: body.externalId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      username: result.username,
      reference: "reference" in result ? result.reference : undefined,
      alreadyPaid: "alreadyPaid" in result ? result.alreadyPaid : false,
    });
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
}
