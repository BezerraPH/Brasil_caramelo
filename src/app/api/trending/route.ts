import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMatilhaTrends } from "@/lib/trending";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const trends = await getMatilhaTrends(20);
  return NextResponse.json({
    trends: trends.map((t) => ({
      tag: t.tag,
      count: t.count,
      href: `/buscar?q=${encodeURIComponent(`#${t.tag}`)}`,
    })),
  });
}
