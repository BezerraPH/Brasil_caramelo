import Link from "next/link";
import { AlbumCreateForm } from "@/components/AlbumCreateForm";
import { BcImage } from "@/components/BcImage";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FotosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const albums = await prisma.album.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <PageContainer>
      <header className="bc-page-header bc-animate-in mb-6">
        <h1 className="text-2xl font-bold text-bc-blue">📷 Fotos</h1>
        <p className="text-sm text-bc-brown">
          Álbuns da matilha — estilo Orkut, grid estilo Insta.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AlbumCreateForm />

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-bc-blue">Meus álbuns</h2>
          {albums.length === 0 ? (
            <div className="bc-card p-8 text-center text-sm text-bc-brown">
              Nenhum álbum ainda. Crie um ao lado e envie suas fotos!
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {albums.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/fotos/${a.id}`}
                    className="bc-card bc-card-interactive block overflow-hidden p-0"
                  >
                    <div className="relative aspect-[4/3] bg-bc-blue/5">
                      {a.coverUrl ? (
                        <BcImage
                          src={a.coverUrl}
                          alt=""
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-4xl text-bc-brown/30">
                          📷
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-bc-blue">{a.name}</p>
                      <p className="text-xs text-bc-brown">
                        {a._count.photos} foto{a._count.photos !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
