import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { refreshAlbumCover } from "@/lib/albums";
import { prisma } from "@/lib/prisma";
import { photoSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ albumId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { albumId } = await params;
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album || album.userId !== user.id) {
    return NextResponse.json({ error: "Álbum não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = photoSchema.parse(body);

    const maxOrder = await prisma.photo.aggregate({
      where: { albumId },
      _max: { sortOrder: true },
    });

    const photo = await prisma.photo.create({
      data: {
        albumId,
        url: data.url,
        thumbUrl: data.thumbUrl ?? null,
        caption: data.caption?.trim() || null,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    await refreshAlbumCover(albumId);
    await prisma.album.update({
      where: { id: albumId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      photo: {
        ...photo,
        createdAt: photo.createdAt.toISOString(),
        commentCount: 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Erro ao adicionar foto." }, { status: 500 });
  }
}
