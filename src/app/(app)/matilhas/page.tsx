import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { MatilhasForumList } from "@/components/MatilhasForumList";
import { getCurrentUser } from "@/lib/auth";

export default async function MatilhasPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <PageContainer narrow>
      <header className="bc-page-header mb-6">
        <Link href="/explorar" className="text-sm text-bc-blue hover:underline">
          ← Explorar
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-bc-blue">Matilhas</h1>
        <p className="text-sm text-bc-brown">
          Comunidades estilo Orkut — fóruns com tópicos, sem feed infinito.
        </p>
      </header>
      <MatilhasForumList />
    </PageContainer>
  );
}
