import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { meiliSearchUsers } from "@/lib/meilisearch-search";
import type { SearchEngine } from "@/lib/meilisearch";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ users: [], engine: "sql" satisfies SearchEngine });
  }

  const usernameQ = q.startsWith("@") ? q.slice(1) : q;
  let engine: SearchEngine = "sql";

  type UserRow = {
    id: string;
    name: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  let users: UserRow[];

  const meili = await meiliSearchUsers(q, user.id);
  if (meili && meili.ids.length > 0) {
    engine = meili.engine;
    const rows = await prisma.user.findMany({
      where: { id: { in: meili.ids }, shadowbanned: false },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
      },
    });
    const order = new Map(meili.ids.map((id, i) => [id, i]));
    users = rows.sort(
      (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
    );
  } else if (meili) {
    engine = meili.engine;
    users = [];
  } else {
    users = await prisma.user.findMany({
      where: {
        shadowbanned: false,
        id: { not: user.id },
        OR: [
          { username: { contains: usernameQ, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
      },
    });
  }

  return NextResponse.json({ users, engine });
}
