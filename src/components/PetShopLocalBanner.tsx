"use client";

type PetShopLocalBannerProps = {
  region?: string | null;
};

export function PetShopLocalBanner({ region }: PetShopLocalBannerProps) {
  if (!region?.trim()) return null;

  return (
    <section className="bc-card mt-6 border-bc-green/25 bg-gradient-to-r from-bc-green/5 to-bc-cream p-5">
      <h2 className="font-bold text-bc-green">🏪 Pet shops em {region}</h2>
      <p className="mt-2 text-xs text-bc-brown">
        Espaço reservado para parceiros locais — cupons e promoções da região
        (integração em desenvolvimento).
      </p>
      <div className="mt-4 rounded-xl border border-dashed border-bc-green/30 bg-bc-white/60 p-4 text-center text-sm text-bc-brown">
        Anuncie aqui com CarameloCoins ou Pedigree — contato com a matilha
      </div>
    </section>
  );
}
