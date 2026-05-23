import { NextResponse } from "next/server";
import type { TribunalCaseStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth";
import { isTribunalJuror } from "@/lib/pet-dna";
import { prisma } from "@/lib/prisma";

const caseInclude = {
  post: {
    select: {
      id: true,
      content: true,
      tribunalHidden: true,
      createdAt: true,
      author: { select: { username: true, name: true } },
      _count: { select: { reports: true } },
    },
  },
  votes: {
    select: { choice: true, jurorId: true },
  },
} as const;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const tab = new URL(request.url).searchParams.get("tab") ?? "open";
  const juror = await isTribunalJuror(user.id);

  if (tab === "mine") {
    const myCases = await prisma.postTribunalCase.findMany({
      where: { post: { authorId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: caseInclude,
    });
    return NextResponse.json({
      juror,
      tab,
      cases: myCases.map((c) => mapCase(c, user.id)),
    });
  }

  const statusFilter: TribunalCaseStatus | { in: TribunalCaseStatus[] } =
    tab === "history" ? { in: ["KEEP", "REMOVED"] } : "OPEN";

  const cases = await prisma.postTribunalCase.findMany({
    where: { status: statusFilter },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: caseInclude,
  });

  return NextResponse.json({
    juror,
    tab,
    cases: cases.map((c) => mapCase(c, user.id)),
  });
}

function mapCase(
  c: {
    id: string;
    postId: string;
    status: string;
    votesKeep: number;
    votesRemove: number;
    resolvedAt: Date | null;
    post: {
      id: string;
      content: string;
      tribunalHidden: boolean;
      createdAt: Date;
      author: { username: string; name: string };
      _count: { reports: number };
    };
    votes: { choice: string; jurorId: string }[];
  },
  userId: string,
) {
  return {
    id: c.id,
    postId: c.postId,
    status: c.status,
    votesKeep: c.votesKeep,
    votesRemove: c.votesRemove,
    resolvedAt: c.resolvedAt?.toISOString() ?? null,
    myVote: c.votes.find((v) => v.jurorId === userId)?.choice ?? null,
    post: {
      ...c.post,
      createdAt: c.post.createdAt.toISOString(),
    },
  };
}
