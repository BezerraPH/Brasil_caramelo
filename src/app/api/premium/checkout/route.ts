import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** Stub de pagamento Pedigree — integração PIX/gateway futura. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const pixKey = process.env.PEDIGREE_PIX_KEY?.trim();
  const amount = process.env.PEDIGREE_PRICE_BRL?.trim() ?? "19.90";

  return NextResponse.json({
    provider: pixKey ? "pix_manual" : "coming_soon",
    amountBrl: amount,
    pixKey: pixKey ?? null,
    instructions: pixKey
      ? "Envie o PIX com seu @username na descrição. Ativação manual em até 24h (alpha)."
      : "Pagamento automático em breve. Use código Pedigree ou apoie via matilha.",
    webhookUrl: "/api/premium/webhook",
  });
}
