import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const region =
    new URL(request.url).searchParams.get("region")?.trim() ||
    process.env.NEXT_PUBLIC_PET_SHOP_REGION?.trim() ||
    "";

  if (!region) {
    return NextResponse.json({ coupons: [], region: null });
  }

  const coupons = await prisma.petShopCoupon.findMany({
    where: { region: { equals: region, mode: "insensitive" }, active: true },
    orderBy: { coinCost: "asc" },
  });

  const redeemed = await prisma.petShopRedemption.findMany({
    where: { userId: user.id, couponId: { in: coupons.map((c) => c.id) } },
    select: { couponId: true, qrToken: true, createdAt: true },
  });
  const redeemedMap = Object.fromEntries(
    redeemed.map((r) => [r.couponId, r]),
  );

  return NextResponse.json({
    region,
    coupons: coupons.map((c) => ({
      ...c,
      redeemed: Boolean(redeemedMap[c.id]),
      qrToken: redeemedMap[c.id]?.qrToken ?? null,
    })),
  });
}
