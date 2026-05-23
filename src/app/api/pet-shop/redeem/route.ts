import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  couponId: z.string(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { couponId } = schema.parse(await request.json());
    const coupon = await prisma.petShopCoupon.findFirst({
      where: { id: couponId, active: true },
    });
    if (!coupon) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    const existing = await prisma.petShopRedemption.findUnique({
      where: { userId_couponId: { userId: user.id, couponId } },
    });
    if (existing) {
      return NextResponse.json({
        ok: true,
        qrToken: existing.qrToken,
        code: coupon.code,
        alreadyRedeemed: true,
      });
    }

    let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) pet = await prisma.pet.create({ data: { userId: user.id } });
    if (pet.coins < coupon.coinCost) {
      return NextResponse.json(
        {
          error: `Precisa de ${coupon.coinCost} CarameloCoins (você tem ${pet.coins}).`,
        },
        { status: 400 },
      );
    }

    const qrToken = `BC-${randomBytes(8).toString("hex").toUpperCase()}`;

    await prisma.$transaction([
      prisma.pet.update({
        where: { id: pet.id },
        data: { coins: pet.coins - coupon.coinCost },
      }),
      prisma.petShopRedemption.create({
        data: { userId: user.id, couponId, qrToken },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      qrToken,
      code: coupon.code,
      coinCost: coupon.coinCost,
    });
  } catch {
    return NextResponse.json({ error: "Falha ao resgatar cupom." }, { status: 400 });
  }
}
