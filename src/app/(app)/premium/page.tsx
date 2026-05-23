import { PageContainer } from "@/components/PageContainer";
import { PedigreePaymentCard } from "@/components/PedigreePaymentCard";
import { PetShopCoupons } from "@/components/PetShopCoupons";
import { PremiumActivate } from "@/components/PremiumActivate";
import { PREMIUM_PERKS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";

export default async function PremiumPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <PageContainer narrow>
      <header className="mb-8 text-center bc-animate-in">
        <span className="text-6xl">👑</span>
        <h1 className="mt-4 text-3xl font-bold text-bc-gold">Pedigree</h1>
        <p className="mt-2 text-bc-brown">
          Apoie o Brasil Caramelo e desbloqueie vantagens na matilha
        </p>
      </header>

      {user.isPremium ? (
        <div className="bc-flash-banner text-center">
          <p className="font-bold text-bc-gold">Você já é Pedigree! ★</p>
          {user.premiumUntil && (
            <p className="text-xs text-bc-brown">
              Até {new Date(user.premiumUntil).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      ) : (
        <>
          <PremiumActivate />
          <PedigreePaymentCard />
        </>
      )}

      <PetShopCoupons region={process.env.NEXT_PUBLIC_PET_SHOP_REGION} />
      {!process.env.NEXT_PUBLIC_PET_SHOP_REGION?.trim() && (
        <p className="bc-card mt-4 p-4 text-center text-xs text-bc-brown">
          Cupons regionais: defina{" "}
          <code className="text-[10px]">NEXT_PUBLIC_PET_SHOP_REGION</code> (ex.:
          Recife ou Caruaru) no servidor.
        </p>
      )}

      <ul className="bc-card mt-6 space-y-3 p-6 text-sm">
        <li>★ Selo dourado no perfil</li>
        <li>🪙 +{Math.round((PREMIUM_PERKS.coinBonus - 1) * 100)}% moedas ao cuidar do pet</li>
        <li>🎉 Iniciar rolezinhos flash</li>
        <li>
          🦴 +{PREMIUM_PERKS.treatLimitBonus} petiscos extras por dia (total{" "}
          {10 + PREMIUM_PERKS.treatLimitBonus}/dia por amigo)
        </li>
        <li>🎨 Tema dourado Pedigree na interface</li>
      </ul>
    </PageContainer>
  );
}
