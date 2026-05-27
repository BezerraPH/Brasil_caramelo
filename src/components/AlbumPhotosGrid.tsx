import Link from "next/link";
import { BcImage } from "./BcImage";

type AlbumPhotosGridProps = {
  photos: {
    id: string;
    albumId: string;
    url: string;
    thumbUrl: string | null;
    caption: string | null;
  }[];
};

export function AlbumPhotosGrid({ photos }: AlbumPhotosGridProps) {
  if (photos.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-bc-blue">Álbuns de fotos</h2>
        <Link href="/fotos" className="text-xs text-bc-blue hover:underline">
          Ver todos →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {photos.map((p) => (
          <Link
            key={p.id}
            href={`/fotos/${p.albumId}/${p.id}`}
            className="relative aspect-square overflow-hidden rounded-lg bg-bc-blue/5"
          >
            <BcImage
              src={p.thumbUrl ?? p.url}
              alt={p.caption ?? ""}
              fill
              sizes="120px"
              className="object-cover"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
