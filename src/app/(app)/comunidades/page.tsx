import Link from "next/link";
import { CommunitiesExplorer } from "@/components/CommunitiesExplorer";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";

export default async function ComunidadesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <PageContainer>
      <header className="bc-community-hero bc-animate-in mb-8 text-center">
        <p className="text-4xl">🏘️</p>
        <h1 className="bc-shimmer-text mt-2 text-3xl font-bold text-bc-blue">
          Comunidades
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-bc-brown">
          Estilo Orkut clássico — cada comunidade com tema, participantes e link
          opcional para a Matilha do assunto.
        </p>
        <Link
          href="/matilhas"
          className="mt-4 inline-block text-xs font-semibold text-bc-green hover:underline"
        >
          Ver Matilhas (fórum) →
        </Link>
      </header>

      <CommunitiesExplorer />
    </PageContainer>
  );
}
