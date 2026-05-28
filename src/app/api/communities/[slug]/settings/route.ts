import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { getCommunityForModeration } from "@/lib/communities";
import { prisma } from "@/lib/prisma";
import { communityRulesSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const community = await getCommunityForModeration(slug, user.id);
  if (!community) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { pinnedRules } = communityRulesSchema.parse(body);

    await prisma.community.update({
      where: { id: community.id },
      data: { pinnedRules: pinnedRules.trim() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
