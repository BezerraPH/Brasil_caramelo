import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const region =
    params.get("region")?.trim() ||
    process.env.NEXT_PUBLIC_PET_SHOP_REGION?.trim() ||
    "";
  const city = params.get("city")?.trim() || "";
  const neighborhood = params.get("neighborhood")?.trim() || "";

  if (!region && !city) {
    return NextResponse.json({ coupons: [], region: null, city: null });
  }

  const where: {
    active: boolean;
    region?: { equals: string; mode: "insensitive" };
    city?: { equals: string; mode: "insensitive" };
    neighborhood?: { contains: string; mode: "insensitive" };
  } = { active: true };

  if (region) {
    where.region = { equals: region, mode: "insensitive" };
  }
  if (city) {
    where.city = { equals: city, mode: "insensitive" };
  }
  if (neighborhood) {
    where.neighborhood = { contains: neighborhood, mode: "insensitive" };
  }

  const coupons = await prisma.petShopCoupon.findMany({
    where,
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
    region: region || null,
    city: city || null,
    coupons: coupons.map((c) => ({
      id: c.id,
      region: c.region,
      city: c.city,
      neighborhood: c.neighborhood,
      address: c.address,
      lat: c.lat,
      lng: c.lng,
      phone: c.phone,
      partnerUrl: c.partnerUrl,
      shopName: c.shopName,
      title: c.title,
      code: c.code,
      coinCost: c.coinCost,
      redeemed: Boolean(redeemedMap[c.id]),
      qrToken: redeemedMap[c.id]?.qrToken ?? null,
    })),
  });
}
