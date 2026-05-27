import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cityCenter, distanceKm } from "@/lib/pet-shop-geo";
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

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { locationCity: true, locationArea: true },
  });

  const filterCity = city || me?.locationCity?.trim() || "";
  const filterArea = neighborhood || me?.locationArea?.trim() || "";

  const where: {
    active: boolean;
    region?: { equals: string; mode: "insensitive" };
    city?: { equals: string; mode: "insensitive" };
    neighborhood?: { contains: string; mode: "insensitive" };
  } = { active: true };

  if (region) {
    where.region = { equals: region, mode: "insensitive" };
  } else if (filterCity) {
    where.city = { equals: filterCity, mode: "insensitive" };
  }

  if (filterArea) {
    where.neighborhood = { contains: filterArea, mode: "insensitive" };
  }

  const coupons = await prisma.petShopCoupon.findMany({
    where,
    orderBy: [{ city: "asc" }, { neighborhood: "asc" }, { coinCost: "asc" }],
  });

  const center = cityCenter(filterCity || region);
  const withDistance = coupons.map((c) => {
    let distanceKmValue: number | null = null;
    if (center && c.lat != null && c.lng != null) {
      distanceKmValue = Math.round(distanceKm(center.lat, center.lng, c.lat, c.lng) * 10) / 10;
    }
    return {
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
      coinCost: c.coinCost,
      distanceKm: distanceKmValue,
    };
  });

  withDistance.sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  return NextResponse.json({
    region: region || null,
    filterCity: filterCity || null,
    filterArea: filterArea || null,
    userRadar: {
      city: me?.locationCity ?? null,
      area: me?.locationArea ?? null,
    },
    partners: withDistance,
  });
}
