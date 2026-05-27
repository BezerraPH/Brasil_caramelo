import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deletePhotoRecord } from "@/lib/albums";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ photoId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { photoId } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: {
      album: {
        include: {
          user: {
            select: { id: true, name: true, username: true, shadowbanned: true },
          },
        },
      },
      _count: { select: { comments: true } },
    },
  });

  if (!photo || photo.album.user.shadowbanned) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    photo: {
      id: photo.id,
      url: photo.url,
      thumbUrl: photo.thumbUrl,
      caption: photo.caption,
      createdAt: photo.createdAt.toISOString(),
      commentCount: photo._count.comments,
      album: {
        id: photo.album.id,
        name: photo.album.name,
      },
      owner: photo.album.user,
    },
    isOwner: photo.album.userId === user.id,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { photoId } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { album: { select: { userId: true } } },
  });

  if (!photo || photo.album.userId !== user.id) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }

  await deletePhotoRecord(photoId);
  return NextResponse.json({ ok: true });
}
