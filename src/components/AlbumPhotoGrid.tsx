"use client";

import Link from "next/link";
import { BcImage } from "./BcImage";

type AlbumPhotoGridProps = {
  albumId: string;
  photos: {
    id: string;
    url: string;
    thumbUrl: string | null;
    caption: string | null;
    commentCount?: number;
  }[];
};

export function AlbumPhotoGrid({ albumId, photos }: AlbumPhotoGridProps) {
  if (photos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-bc-brown">
        Este álbum ainda não tem fotos. Envie a primeira!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:gap-2">
      {photos.map((p) => (
        <Link
          key={p.id}
          href={`/fotos/${albumId}/${p.id}`}
          className="bc-album-photo-cell relative aspect-square overflow-hidden rounded-lg bg-bc-blue/5 transition hover:ring-2 hover:ring-bc-caramel/50"
        >
          <BcImage
            src={p.thumbUrl ?? p.url}
            alt={p.caption ?? "Foto do álbum"}
            fill
            sizes="(max-width:768px) 33vw, 200px"
            className="object-cover"
          />
          {(p.commentCount ?? 0) > 0 && (
            <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
              💬 {p.commentCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
