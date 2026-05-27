import Link from "next/link";
import { BcImage } from "./BcImage";
import { BcVideo } from "./BcVideo";

type ProfileMediaGridProps = {
  posts: {
    id: string;
    content: string;
    imageUrl: string | null;
    videoUrl: string | null;
    videoHlsUrl?: string | null;
    createdAt: string;
  }[];
  mode: "INSTA" | "REELS";
};

export function ProfileMediaGrid({ posts, mode }: ProfileMediaGridProps) {
  const filtered =
    mode === "INSTA"
      ? posts.filter((p) => p.imageUrl)
      : posts.filter((p) => p.videoUrl);

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-bc-brown">
        {mode === "INSTA"
          ? "Nenhuma foto ainda — recados com imagem viram legenda no Insta."
          : "Nenhum vídeo curto ainda — publique no Cinelar!"}
      </p>
    );
  }

  if (mode === "REELS") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/feed?post=${p.id}`}
            className="bc-card-interactive overflow-hidden rounded-xl"
          >
            <div className="relative aspect-[9/16] max-h-64 bg-black">
              <BcVideo
                src={p.videoUrl!}
                hlsSrc={p.videoHlsUrl}
                className="h-full w-full object-cover"
              />
              <span className="bc-reels-winner-badge absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">
                ▶ Cinelar
              </span>
            </div>
            {p.content && (
              <p className="line-clamp-2 p-2 text-xs text-bc-brown">{p.content}</p>
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {filtered.map((p) => (
        <Link
          key={p.id}
          href={`/feed?post=${p.id}`}
          className="relative aspect-square overflow-hidden rounded-lg bg-bc-blue/5"
        >
          <BcImage src={p.imageUrl!} alt="" fill className="object-cover" />
          {p.content && (
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1 text-[9px] text-white line-clamp-2">
              {p.content}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
