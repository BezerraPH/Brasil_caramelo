import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PetShopExplorer } from "@/components/PetShopExplorer";
import { getCurrentUser } from "@/lib/auth";

export default async function PetShopsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const region = process.env.NEXT_PUBLIC_PET_SHOP_REGION?.trim() || null;

  return (
    <PageContainer>
      <header className="bc-page-header bc-animate-in mb-6 text-center">
        <span className="text-5xl">🏪</span>
        <h1 className="mt-3 text-2xl font-bold text-bc-green">Pet shops parceiros</h1>
        <p className="mt-2 text-sm text-bc-brown">
          Cupons reais por cidade e bairro — use o radar do seu perfil para achar lojas perto.
        </p>
        <Link href="/premium" className="bc-btn-gold mt-4 inline-block text-sm">
          Ver cupons e resgatar →
        </Link>
      </header>
      <PetShopExplorer defaultRegion={region} />
    </PageContainer>
  );
}
