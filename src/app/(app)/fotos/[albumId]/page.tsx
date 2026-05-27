import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumPhotoGrid } from "@/components/AlbumPhotoGrid";
import { AlbumPhotoUploader } from "@/components/AlbumPhotoUploader";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function AlbumPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { albumId } = await params;
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      user: { select: { username: true, name: true } },
      photos: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { comments: true } } },
      },
    },
  });

  if (!album) notFound();

  const isOwner = album.userId === user.id;

  return (
    <PageContainer>
      <header className="bc-animate-in mb-6">
        <Link href="/fotos" className="text-sm text-bc-blue hover:underline">
          ← Todos os álbuns
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-bc-blue">{album.name}</h1>
        <p className="text-sm text-bc-brown">
          por{" "}
          <Link
            href={`/perfil/${album.user.username}`}
            className="font-medium text-bc-blue hover:underline"
          >
            {album.user.name}
          </Link>
          {album.description && (
            <span className="mt-1 block italic">{album.description}</span>
          )}
        </p>
      </header>

      {isOwner && <AlbumPhotoUploader albumId={album.id} />}

      <AlbumPhotoGrid
        albumId={album.id}
        photos={album.photos.map((p) => ({
          id: p.id,
          url: p.url,
          thumbUrl: p.thumbUrl,
          caption: p.caption,
          commentCount: p._count.comments,
        }))}
      />
    </PageContainer>
  );
}
