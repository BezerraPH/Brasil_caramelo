import { NextResponse } from "next/server";
import { isMeilisearchEnabled } from "@/lib/meilisearch";
import { reindexAllMeilisearch } from "@/lib/meilisearch-index";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  return token === secret || headerSecret === secret;
}

/** Reindexa usuários e recados no Meilisearch (cron ou deploy). */
export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isMeilisearchEnabled()) {
    return NextResponse.json(
      { error: "MEILISEARCH_HOST / MEILISEARCH_MASTER_KEY não configurados." },
      { status: 503 },
    );
  }

  const counts = await reindexAllMeilisearch();
  return NextResponse.json({ ok: true, ...counts });
}
