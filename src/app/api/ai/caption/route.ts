import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { DOG_REPUTATION_LEVELS } from "@/lib/constants";
import { suggestCaption } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { summarizeReputation } from "@/lib/reputation";

const schema = z.object({
  hint: z.string().max(200).optional(),
  level: z.enum(DOG_REPUTATION_LEVELS).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());
    let level = body.level;

    if (!level) {
      const reps = await prisma.reputation.findMany({
        where: { toUserId: user.id },
        select: { level: true },
      });
      const summary = summarizeReputation(reps.map((r) => r.level));
      level = summary.dominant?.level ?? "CARAMELO";
    }

    const caption = await suggestCaption(level, body.hint);
    return NextResponse.json({
      caption,
      aiPowered: Boolean(process.env.OPENAI_API_KEY),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível sugerir legenda." }, { status: 400 });
  }
}
