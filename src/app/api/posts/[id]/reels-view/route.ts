import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { recordReelView } from "@/lib/cinelar-fyp";
import { z } from "zod";

const bodySchema = z.object({
  watchMs: z.number().int().min(0).max(600_000),
  completed: z.boolean().optional(),
  liked: z.boolean().optional(),
  shared: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: postId } = await context.params;

  try {
    const body = bodySchema.parse(await request.json());
    const reelScore = await recordReelView(user.id, postId, body);
    if (reelScore === null) {
      return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, reelScore });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
