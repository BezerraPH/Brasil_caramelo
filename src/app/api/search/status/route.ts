import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isMeilisearchEnabled } from "@/lib/meilisearch";
import { isWebPushConfigured } from "@/lib/web-push-server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return NextResponse.json({
    meilisearch: isMeilisearchEnabled(),
    webPush: isWebPushConfigured(),
  });
}
