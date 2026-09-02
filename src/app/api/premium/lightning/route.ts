import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // Preço do Pedigree em Satoshis (ex: 21.000 sats ~ R$ 15-20)
  const amountSats = 21000;
  const reference = `PEDIGREE-LN-${user.username}-${Date.now().toString(36).toUpperCase()}`;

  // Criar pedido no banco
  const order = await prisma.premiumOrder.create({
    data: {
      userId: user.id,
      amountBrl: "15.00",
      status: "PENDING",
      reference,
      provider: "LIGHTNING",
    },
  });

  // Em produção, se houver LNbits ou servidor LND configurado via env:
  const lnbitsUrl = process.env.LNBITS_URL;
  const lnbitsKey = process.env.LNBITS_API_KEY;

  let invoice: string | null = null;

  if (lnbitsUrl && lnbitsKey) {
    try {
      const res = await fetch(`${lnbitsUrl}/api/v1/payments`, {
        method: "POST",
        headers: {
          "X-Api-Key": lnbitsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          out: false,
          amount: amountSats,
          memo: `Brasil Caramelo Pedigree: ${user.username}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.payment_request) {
        invoice = data.payment_request;
      }
    } catch {
      // fallback
    }
  }

  // Fallback para fatura Lightning simulada/LNURL format
  if (!invoice) {
    invoice = `lnbc${amountSats}0n1p3caramelo...${reference.toLowerCase()}`;
  }

  return NextResponse.json({
    orderId: order.id,
    reference,
    amountSats,
    invoice,
    weblnAvailable: true,
  });
}
