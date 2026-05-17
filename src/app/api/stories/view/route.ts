import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  storyIds: z.array(z.string().min(1)).min(1).max(50),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { storyIds } = bodySchema.parse(await request.json());
    const now = new Date();

    const stories = await prisma.story.findMany({
      where: { id: { in: storyIds }, expiresAt: { gt: now } },
      select: { id: true },
    });
    const validIds = stories.map((s) => s.id);
    if (validIds.length === 0) {
      return NextResponse.json({ ok: true, marked: 0 });
    }

    await prisma.storyView.createMany({
      data: validIds.map((storyId) => ({ storyId, userId: user.id })),
      skipDuplicates: true,
    });

    return NextResponse.json({ ok: true, marked: validIds.length });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
