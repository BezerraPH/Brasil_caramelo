import { prisma } from "./prisma";
import { deletePhotoMedia } from "./storage";

/** Atualiza capa do álbum com a foto mais recente. */
export async function refreshAlbumCover(albumId: string): Promise<void> {
  const latest = await prisma.photo.findFirst({
    where: { albumId },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    select: { thumbUrl: true, url: true },
  });

  await prisma.album.update({
    where: { id: albumId },
    data: { coverUrl: latest ? (latest.thumbUrl ?? latest.url) : null },
  });
}

export async function deletePhotoRecord(photoId: string): Promise<void> {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { id: true, albumId: true, url: true, thumbUrl: true },
  });
  if (!photo) return;

  await prisma.photo.delete({ where: { id: photoId } });
  await deletePhotoMedia(photo.url, photo.thumbUrl);
  await refreshAlbumCover(photo.albumId);
}
