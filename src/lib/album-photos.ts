import { prisma } from "./prisma";

export type AlbumPhotoPreview = {
  id: string;
  albumId: string;
  url: string;
  thumbUrl: string | null;
  caption: string | null;
};

/** Fotos recentes de álbuns para grid Insta no perfil. */
export async function getRecentAlbumPhotos(
  userId: string,
  limit = 12,
): Promise<AlbumPhotoPreview[]> {
  const photos = await prisma.photo.findMany({
    where: { album: { userId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      albumId: true,
      url: true,
      thumbUrl: true,
      caption: true,
    },
  });
  return photos;
}
