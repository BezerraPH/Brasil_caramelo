import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listCommunities } from "@/lib/communities";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const query = searchParams.get("q") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const filtered =
    category && category !== "todos" ? category : undefined;

  const communities = await listCommunities(user?.id ?? null, {
    category: filtered,
    query,
    sort,
  });
  return NextResponse.json({ communities });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Você precisa estar conectado para criar uma comunidade." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { createCommunity } = await import("@/lib/communities");
    const community = await createCommunity(user.id, {
      name: body.name ?? "",
      description: body.description ?? "",
      category: body.category ?? "outros",
      emoji: body.emoji ?? "🏘️",
      themePrimary: body.themePrimary ?? "#005f38",
      themeAccent: body.themeAccent ?? "#ffc72c",
      pinnedRules: body.pinnedRules ?? "",
    });

    return NextResponse.json({ ok: true, community });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao criar comunidade.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
