import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const activateSchema = z.object({
  code: z.string().min(4).max(40),
});

const DEMO_CODES = ["PEDIGREE", "CARAMELO2026", "MATILHA"];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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
