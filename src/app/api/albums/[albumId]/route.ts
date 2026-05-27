import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { deletePhotoRecord } from "@/lib/albums";
import { prisma } from "@/lib/prisma";
import { albumUpdateSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ albumId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { albumId } = await params;
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      user: { select: { id: true, name: true, username: true, shadowbanned: true } },
      photos: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { comments: true } } },
      },
    },
  });

  if (!album || album.user.shadowbanned) {
    return NextResponse.json({ error: "Álbum não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    album: {
      id: album.id,
      name: album.name,
      description: album.description,
      coverUrl: album.coverUrl,
      userId: album.userId,
      owner: album.user,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt.toISOString(),
      photos: album.photos.map((p) => ({
        id: p.id,
        url: p.url,
        thumbUrl: p.thumbUrl,
        caption: p.caption,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt.toISOString(),
        commentCount: p._count.comments,
      })),
    },
    isOwner: album.userId === user.id,
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
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
    const data = albumUpdateSchema.parse(body);

    const updated = await prisma.album.update({
      where: { id: albumId },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined
          ? { description: data.description?.trim() || null }
          : {}),
      },
    });

    return NextResponse.json({
      album: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Erro ao atualizar álbum." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { albumId } = await params;
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: { photos: { select: { id: true } } },
  });

  if (!album || album.userId !== user.id) {
    return NextResponse.json({ error: "Álbum não encontrado." }, { status: 404 });
  }

  for (const photo of album.photos) {
    await deletePhotoRecord(photo.id);
  }

  await prisma.album.delete({ where: { id: albumId } });
  return NextResponse.json({ ok: true });
}
