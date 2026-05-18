import { NextResponse } from "next/server";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const userId = params.get("userId") ?? user.id;

  const rows = await prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "asc" },
  });

  const achievements = rows.map((r) => {
    const meta = ACHIEVEMENTS[r.key as keyof typeof ACHIEVEMENTS];
    return {
      key: r.key,
      unlockedAt: r.unlockedAt.toISOString(),
      title: meta?.title ?? r.key,
      emoji: meta?.emoji ?? "🏅",
      desc: meta?.desc ?? "",
    };
  });

  return NextResponse.json({ achievements });
}
