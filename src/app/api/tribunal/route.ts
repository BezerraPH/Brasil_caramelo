import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isTribunalJuror } from "@/lib/pet-dna";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const juror = await isTribunalJuror(user.id);

  const cases = await prisma.postTribunalCase.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      post: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: { username: true, name: true } },
          _count: { select: { reports: true } },
        },
      },
      votes: {
        where: { jurorId: user.id },
        select: { choice: true },
      },
    },
  });

  return NextResponse.json({
    juror,
    cases: cases.map((c) => ({
      id: c.id,
      postId: c.postId,
      votesKeep: c.votesKeep,
      votesRemove: c.votesRemove,
      myVote: c.votes[0]?.choice ?? null,
      post: c.post,
    })),
  });
}
