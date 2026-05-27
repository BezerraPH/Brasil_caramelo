import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getThreadPollResults } from "@/lib/thread-poll";

type RouteContext = { params: Promise<{ slug: string }> };

/** Enquetes ativas da Matilha para exibir no topo do fórum (feed de enquetes). */
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;

  const pack = await prisma.pack.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!pack) {
    return NextResponse.json({ error: "Matilha não encontrada." }, { status: 404 });
  }

  const threads = await prisma.thread.findMany({
    where: {
      packId: pack.id,
      archived: false,
      poll: { isNot: null },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  const polls = await Promise.all(
    threads.map(async (t) => {
      const poll = await getThreadPollResults(t.id, user.id);
      return poll
        ? {
            threadId: t.id,
            threadTitle: t.title,
            createdAt: t.createdAt.toISOString(),
            poll,
          }
        : null;
    }),
  );

  return NextResponse.json({
    packName: pack.name,
    items: polls.filter(Boolean),
  });
}
