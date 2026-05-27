import Link from "next/link";
import { Suspense } from "react";
import { AppVersionBadge } from "@/components/AppVersionBadge";
import { MatilhaConnectionChip } from "@/components/MatilhaConnectionChip";
import { ExplorarHubGrid } from "@/components/ExplorarHubGrid";
import { FederationFeed } from "@/components/FederationFeed";
import { MatilhaSearchStrip } from "@/components/MatilhaSearchStrip";
import { RoadmapPanel } from "@/components/RoadmapPanel";
import { FederationSyncButton } from "@/components/FederationSyncButton";
import { MatilhaHealthPanel } from "@/components/MatilhaHealthPanel";
import { MatilhaServiceStatus } from "@/components/MatilhaServiceStatus";
import { MatilhaStatsCards } from "@/components/MatilhaStatsCards";
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
      <header className="bc-explorar-hero mb-8 text-center bc-animate-in">
        <h1 className="bc-shimmer-text text-3xl font-bold text-bc-blue">
          Explorar
        </h1>
        <p className="mt-2 text-bc-brown">Tudo que o Brasil Caramelo oferece</p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <AppVersionBadge showStage />
          <MatilhaConnectionChip />
        </p>
      </header>

      <MatilhaStatsCards />

      <MatilhaHealthPanel />

      <MatilhaServiceStatus />

      <section className="bc-card bc-animate-in mb-8 p-5">
        <h2 className="font-bold text-bc-blue">🌐 Caramelo-Sync</h2>
        <p className="mt-1 text-xs text-bc-brown">
          Importe recados de outros servidores na LAN ou na tailnet Tailscale
        </p>
        <FederationSyncButton className="mt-4" fullWidth />
      </section>

      <section className="bc-card bc-animate-in mb-8 p-6">
        <h2 className="mb-2 text-center font-bold text-bc-blue">
          🔥 Trending da matilha
        </h2>
        <p className="mb-4 text-center text-xs text-bc-brown">
          Hashtags e palavras quentes dos últimos 7 dias
        </p>
        <Suspense
          fallback={
            <p className="text-center text-sm text-bc-brown">Farejando…</p>
          }
        >
          <TrendingCloud />
        </Suspense>
      </section>

      <MatilhaSearchStrip />

      <ExplorarHubGrid />

      <section className="bc-card mt-8 p-5">
        <h2 className="mb-3 font-bold text-bc-blue">Casinhas em destaque</h2>
        <div className="flex flex-wrap gap-2">
          {CASINHAS.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/casinha/${c.slug}`}
              className="rounded-full border border-bc-blue/20 bg-bc-white px-3 py-1 text-xs font-medium text-bc-blue hover:bg-bc-green/10"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-center text-lg font-bold text-bc-blue">
          Roadmap da matilha
        </h2>
        <RoadmapPanel />
      </section>

      <FederationFeed />
    </PageContainer>
  );
}
