import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { TestimonialsInbox } from "@/components/TestimonialsInbox";
import { getCurrentUser } from "@/lib/auth";

export default async function DepoimentosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <PageContainer narrow>
      <header className="bc-page-header mb-6">
        <Link href={`/perfil/${user.username}`} className="text-sm text-bc-blue hover:underline">
          ← Voltar ao perfil
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-bc-blue">Depoimentos pendentes</h1>
        <p className="text-sm text-bc-brown">
          Aceite, recuse ou responda — estilo Orkut, com chat privado até publicar.
        </p>
      </header>
      <TestimonialsInbox />
    </PageContainer>
  );
}
