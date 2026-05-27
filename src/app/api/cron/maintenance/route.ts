import { NextResponse } from "next/server";
import { finalizeExpiredBattles } from "@/lib/battles";
import { purgeExpiredStories } from "@/lib/cleanup";
import {
  notifyClosedPolls,
  releaseTimeCapsules,
  remindPackEvents,
} from "@/lib/cron-matilha";
import { refreshMatilhaTrends } from "@/lib/trending";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  return token === secret || headerSecret === secret;
}

/** Limpeza periódica: batalhas, stories expirados, trending. */
export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [battles, stories, trends, capsules, polls, events] = await Promise.all([
    finalizeExpiredBattles(),
    purgeExpiredStories(),
    refreshMatilhaTrends(),
    releaseTimeCapsules(),
    notifyClosedPolls(),
    remindPackEvents(),
  ]);

  return NextResponse.json({
    ok: true,
    battlesFinalized: battles,
    storiesPurged: stories,
    trendsRefreshed: trends,
    capsulesReleased: capsules,
    pollsNotified: polls,
    eventReminders: events,
  });
}
