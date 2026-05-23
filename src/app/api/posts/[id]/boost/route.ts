import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  BOOST_COST_COINS,
  BOOST_DURATION_MS,
} from "@/lib/post-boost-constants";
import { unlockAchievement } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 5, 60_000, "post-boost")) {
    return NextResponse.json(
      { error: "Aguarde antes de impulsionar outro recado." },
      { status: 429 },
    );
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true, communityLevel: true, boostedUntil: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }
  if (post.authorId !== user.id) {
    return NextResponse.json(
      { error: "Só o autor pode impulsionar." },
      { status: 403 },
    );
  }
  if (post.communityLevel) {
    return NextResponse.json(
      { error: "Impulsionar só no feed global." },
      { status: 400 },
    );
  }

  const now = new Date();
  if (post.boostedUntil && post.boostedUntil > now) {
    return NextResponse.json(
      { error: "Este recado já está impulsionado." },
      { status: 400 },
    );
  }

  let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) pet = await prisma.pet.create({ data: { userId: user.id } });
  if (pet.coins < BOOST_COST_COINS) {
    return NextResponse.json(
      {
        error: `Precisa de ${BOOST_COST_COINS} CarameloCoins (você tem ${pet.coins}).`,
      },
      { status: 400 },
    );
  }

  const boostedUntil = new Date(Date.now() + BOOST_DURATION_MS);

  await prisma.$transaction([
    prisma.pet.update({
      where: { id: pet.id },
      data: { coins: pet.coins - BOOST_COST_COINS },
    }),
    prisma.post.update({
      where: { id },
      data: {
        boostedUntil,
        boostPriority: Math.floor(Date.now() / 1000),
      },
    }),
  ]);

  const unlocked = await unlockAchievement(user.id, "POST_BOOST_FIRST");

  return NextResponse.json({
    boostedUntil: boostedUntil.toISOString(),
    cost: BOOST_COST_COINS,
    newAchievement: unlocked ? ("POST_BOOST_FIRST" as const) : null,
  });
}
