import Link from "next/link";
import { Suspense } from "react";
import { ExplorarSearchHero } from "@/components/ExplorarSearchHero";
import { ExplorarHubGrid } from "@/components/ExplorarHubGrid";
import { PageContainer } from "@/components/PageContainer";
import { TrendingCloud } from "@/components/TrendingCloud";
import { getCurrentUser } from "@/lib/auth";
import { CASINHAS } from "@/lib/casinhas";
import { refreshMatilhaTrends } from "@/lib/trending";

export default async function ExplorarPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  void refreshMatilhaTrends();

  return (
    <PageContainer>
      <ExplorarSearchHero />

      {/* Tendências da Matilha */}
      <section className="bc-card bc-animate-in mb-8 p-6">
        <div className="flex items-center justify-between border-b border-bc-caramel/15 pb-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-bc-blue flex items-center gap-2">
              <span>🔥</span> Tendências da Semana
            </h2>
            <p className="text-xs font-medium text-bc-brown">
              Assuntos, hashtags e temas mais comentados na matilha
            </p>
          </div>
          <Link href="/buscar" className="text-xs font-bold text-bc-green hover:underline">
            Ver todas →
          </Link>
        </div>

        <Suspense
          fallback={
            <p className="text-center text-sm text-bc-brown py-4 font-semibold">Farejando tendências…</p>
          }
        >
          <TrendingCloud />
        </Suspense>
      </section>

      {/* Casinhas em Destaque */}
      <section className="bc-card bc-animate-in mb-8 p-6">
        <div className="flex items-center justify-between border-b border-bc-caramel/15 pb-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-bc-blue flex items-center gap-2">
              <span>🏠</span> Casinhas da Matilha
            </h2>
            <p className="text-xs font-medium text-bc-brown">
              Comunidades temáticas organizadas por personalidade canina
            </p>
          </div>
          <Link href="/casinhas" className="text-xs font-bold text-bc-green hover:underline">
            Ver todas as 10 casinhas →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CASINHAS.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/casinha/${c.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-bc-caramel/20 bg-bc-sand/20 p-3.5 transition hover:border-bc-green hover:bg-bc-green/5 hover:scale-[1.01]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bc-white text-2xl shadow-sm">
                {c.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm text-bc-blue truncate">{c.name}</p>
                <p className="text-xs font-medium text-bc-brown line-clamp-1">{c.tagline}</p>
                <span className="mt-1 inline-block text-[10px] font-bold text-bc-green">
                  🟢 Comunidade ativa
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Catálogo de Recursos e Jogos */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-bc-blue mb-4 flex items-center gap-2">
          <span>🧭</span> Central de Recursos & Jogos
        </h2>
        <ExplorarHubGrid />
      </section>
    </PageContainer>
  );
}
