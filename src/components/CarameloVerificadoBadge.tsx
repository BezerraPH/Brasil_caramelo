import type { CarameloTierInfo } from "@/lib/caramelo-tier";

type CarameloVerificadoBadgeProps = {
  tier: CarameloTierInfo;
  className?: string;
};

/** Selo Caramelo de Ouro — Bronze, Prata ou Ouro por bom comportamento. */
export function CarameloVerificadoBadge({
  tier,
  className = "",
}: CarameloVerificadoBadgeProps) {
  if (tier.tier === "NONE") return null;

  const glow =
    tier.tier === "GOLD"
      ? "border-bc-gold/60 bg-gradient-to-r from-bc-gold/20 to-bc-caramel/15 text-bc-gold"
      : tier.tier === "SILVER"
        ? "border-slate-400/50 bg-slate-200/30 text-slate-300"
        : "border-amber-700/40 bg-amber-900/20 text-amber-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${glow} ${className}`}
      title={`${tier.label} — perfil ativo, depoimentos e Matilha`}
    >
      <span aria-hidden>{tier.emoji}</span>
      {tier.label}
    </span>
  );
}
