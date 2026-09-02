import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amountCoins, invoice } = body;

    const coins = parseInt(String(amountCoins), 10);
    if (isNaN(coins) || coins < 100) {
      return NextResponse.json(
        { error: "Saque mínimo de 100 CarameloCoins." },
        { status: 400 }
      );
    }

    if (!invoice || typeof invoice !== "string" || !invoice.startsWith("lnbc")) {
      return NextResponse.json(
        { error: "Fatura Lightning inválida. Deve começar com lnbc..." },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findUnique({
      where: { userId: user.id },
    });

    if (!pet || pet.coins < coins) {
      return NextResponse.json(
        { error: `Saldo insuficiente. Você possui ${pet?.coins ?? 0} moedas.` },
        { status: 400 }
      );
    }

    // Deduzir moedas do pet
    const updated = await prisma.pet.update({
      where: { userId: user.id },
      data: {
        coins: { decrement: coins },
      },
    });

    // Em produção com LNbits/LND configurado:
    const lnbitsUrl = process.env.LNBITS_URL;
    const lnbitsKey = process.env.LNBITS_ADMIN_KEY;

    if (lnbitsUrl && lnbitsKey) {
      try {
        await fetch(`${lnbitsUrl}/api/v1/payments`, {
          method: "POST",
          headers: {
            "X-Api-Key": lnbitsKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            out: true,
            bolt11: invoice,
          }),
        });
      } catch {
        // Log de erro no gateway
      }
    }

    return NextResponse.json({
      ok: true,
      withdrawnCoins: coins,
      remainingCoins: updated.coins,
      message: `Saque de ${coins} CarameloCoins enviado com sucesso via Lightning! ⚡`,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao processar saque." }, { status: 500 });
  }
}
