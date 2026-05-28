import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { getCommunityBySlug } from "@/lib/communities";
import { prisma } from "@/lib/prisma";
import { communityModeratorSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) {
    return NextResponse.json({ error: "Comunidade não encontrada." }, { status: 404 });
  }

  const mods = await prisma.communityMember.findMany({
    where: { communityId: community.id, role: "MODERATOR" },
    include: {
      user: { select: { username: true, name: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json({
    owner: community.owner,
    moderators: mods.map((m) => m.user),
    canManage: community.isOwner,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community?.isOwner) {
    return NextResponse.json({ error: "Só o dono pode gerenciar moderadores." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, action } = communityModeratorSchema.parse(body);

    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    if (target.id === community.ownerId) {
      return NextResponse.json({ error: "O dono já é administrador." }, { status: 400 });
    }

    const member = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: community.id, userId: target.id },
      },
    });
    if (!member) {
      return NextResponse.json(
        { error: "O usuário precisa participar da comunidade primeiro." },
        { status: 400 },
      );
    }

    await prisma.communityMember.update({
      where: { id: member.id },
      data: { role: action === "promote" ? "MODERATOR" : "MEMBER" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
