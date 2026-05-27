import Link from "next/link";
import Image from "next/image";
import type { AlbumPhotoPreview } from "@/lib/album-photos";

type ProfileOrkutPhotosMiniProps = {
  username: string;
  photos: AlbumPhotoPreview[];
  isOwnProfile?: boolean;
};

/** Mini-grid de fotos recentes na coluna Orkut. */
export function ProfileOrkutPhotosMini({
  username,
  photos,
  isOwnProfile = false,
}: ProfileOrkutPhotosMiniProps) {
  if (photos.length === 0) return null;

  const preview = photos.slice(0, 6);

  return (
    <section className="bc-orkut-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-bc-blue">📷 Fotos recentes</h2>
        <Link
          href={isOwnProfile ? "/fotos" : `/perfil/${username}`}
          className="text-xs font-medium text-bc-blue hover:underline"
        >
          {isOwnProfile ? "Meus álbuns →" : "Ver perfil →"}
        </Link>
      </div>
      <ul className="grid grid-cols-3 gap-1.5">
        {preview.map((ph) => (
          <li key={ph.id}>
            <Link
              href={`/fotos/${ph.albumId}/${ph.id}`}
              className="bc-orkut-photo-thumb block overflow-hidden rounded-lg"
            >
              <Image
                src={ph.thumbUrl ?? ph.url}
                alt={ph.caption ?? "Foto"}
                width={120}
                height={120}
                className="aspect-square h-full w-full object-cover transition hover:scale-105"
                unoptimized={ph.url.startsWith("/api/media/")}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
