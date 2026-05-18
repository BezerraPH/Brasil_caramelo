import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateShadowban } from "@/lib/shadowban";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(_request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 10, 60_000, "reports")) {
    return NextResponse.json(
      { error: "Muitas denúncias. Tente mais tarde." },
      { status: 429 },
    );
  }

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }
  if (post.authorId === user.id) {
    return NextResponse.json(
      { error: "Você não pode denunciar o próprio recado." },
      { status: 400 },
    );
  }

  try {
    await prisma.postReport.create({
      data: { postId, reporterId: user.id },
    });
  } catch {
    return NextResponse.json({ ok: true, alreadyReported: true });
  }

  await evaluateShadowban(post.authorId);

  return NextResponse.json({ ok: true });
}
