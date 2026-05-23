import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMatilhaTrends } from "@/lib/trending";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const raw = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  const prefix = raw.replace(/^#/, "");

  const trends = await getMatilhaTrends(32);
  const matched =
    prefix.length >= 1
      ? trends.filter((t) => t.tag.startsWith(prefix))
      : trends.slice(0, 10);

  const suggestions = matched.slice(0, 8).map((t) => ({
    type: "tag" as const,
    label: `#${t.tag}`,
    count: t.count,
    href: `/buscar?tag=${encodeURIComponent(t.tag)}&tab=posts`,
  }));

  return NextResponse.json({ suggestions });
}
