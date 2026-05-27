import Link from "next/link";
import { notFound } from "next/navigation";
import { BcImage } from "@/components/BcImage";
import { PageContainer } from "@/components/PageContainer";
import { PhotoCommentsSection } from "@/components/PhotoCommentsSection";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ albumId: string; photoId: string }>;
};

export default async function PhotoPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { albumId, photoId } = await params;

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, albumId },
    include: {
      album: {
        include: {
          user: { select: { username: true, name: true } },
        },
      },
      _count: { select: { comments: true } },
    },
  });

  if (!photo) notFound();

  return (
    <PageContainer narrow>
      <header className="mb-4">
        <Link
          href={`/fotos/${albumId}`}
          className="text-sm text-bc-blue hover:underline"
        >
          ← {photo.album.name}
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <figure className="bc-card overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-bc-blue/5 sm:aspect-auto sm:min-h-[320px]">
            <BcImage
              src={photo.url}
              alt={photo.caption ?? "Foto do álbum"}
              fill
              sizes="(max-width:768px) 100vw, 640px"
              className="object-contain"
            />
          </div>
          {photo.caption && (
            <figcaption className="border-t border-bc-blue/10 p-4 text-sm text-bc-brown">
              {photo.caption}
            </figcaption>
          )}
          <p className="px-4 pb-3 text-xs text-bc-brown/70">
            {photo.album.user.name} ·{" "}
            {new Date(photo.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </figure>

        <PhotoCommentsSection
          photoId={photo.id}
          initialCount={photo._count.comments}
        />
      </div>
    </PageContainer>
  );
}
