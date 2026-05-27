import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
} from "@/lib/communities";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!(await checkRateLimit(key, 30, 60_000, "community-join"))) {
    return NextResponse.json(
      { error: "Muitas ações. Aguarde um momento." },
      { status: 429 },
    );
  }

  const { slug } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) {
    return NextResponse.json(
      { error: "Comunidade não encontrada." },
      { status: 404 },
    );
  }

  await joinCommunity(community.id, user.id);
  return NextResponse.json({ ok: true, isMember: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) {
    return NextResponse.json(
      { error: "Comunidade não encontrada." },
      { status: 404 },
    );
  }

  await leaveCommunity(community.id, user.id);
  return NextResponse.json({ ok: true, isMember: false });
}
