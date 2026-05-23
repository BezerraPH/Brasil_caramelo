import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

const activateSchema = z.object({
  code: z.string().min(4).max(40),
});

const DEMO_CODES = ["PEDIGREE", "CARAMELO2026", "MATILHA"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isPremium: true, premiumUntil: true },
  });

  return NextResponse.json({
    isPremium: row?.isPremium ?? false,
    premiumUntil: row?.premiumUntil?.toISOString() ?? null,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 10, 60 * 60_000, "premium")) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento." },
      { status: 429 },
    );
  }

  try {
    const { code } = activateSchema.parse(await request.json());
    const normalized = code.trim().toUpperCase();
    const valid =
      DEMO_CODES.includes(normalized) ||
      (process.env.PREMIUM_CODE &&
        normalized === process.env.PREMIUM_CODE.toUpperCase());

    if (!valid) {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }

    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + 30);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: true, premiumUntil },
      select: { isPremium: true, premiumUntil: true },
    });

    return NextResponse.json({
      ok: true,
      isPremium: updated.isPremium,
      premiumUntil: updated.premiumUntil?.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }
}
