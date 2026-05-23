import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** Status de vídeo/HLS de um recado (polling após publicar). */
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { videoUrl: true, videoHlsUrl: true, authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Recado não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    videoUrl: post.videoUrl,
    videoHlsUrl: post.videoHlsUrl,
    hlsReady: Boolean(post.videoHlsUrl),
    hasVideo: Boolean(post.videoUrl),
  });
}
