import { NextResponse } from "next/server";
import { refreshMatilhaTrends } from "@/lib/trending";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");

  if (!secret || (token !== secret && headerSecret !== secret)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const count = await refreshMatilhaTrends();
  return NextResponse.json({ refreshed: count });
}
