import { NextResponse } from "next/server";
import { isMeilisearchEnabled } from "@/lib/meilisearch";
import { getOpsSnapshot } from "@/lib/ops-metrics";
import { isRedisEnabled, getRedis } from "@/lib/redis";
import { isWebPushConfigured } from "@/lib/web-push-server";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  return token === secret || headerSecret === secret;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let redisPing = false;
  if (isRedisEnabled()) {
    const redis = await getRedis();
    if (redis) {
      try {
        redisPing = (await redis.ping()) === "PONG";
      } catch {
        redisPing = false;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    ...getOpsSnapshot(),
    infra: {
      redis: { configured: isRedisEnabled(), ping: redisPing },
      meilisearch: isMeilisearchEnabled(),
      webPush: isWebPushConfigured(),
    },
  });
}
