type CarameloRadarBadgeProps = {
  city: string;
  area?: string | null;
  className?: string;
};

/** Radar de Caramelo — selo de região (nunca GPS em tempo real). */
export function CarameloRadarBadge({
  city,
  area,
  className = "",
}: CarameloRadarBadgeProps) {
  const place = area?.trim() ? `${area.trim()}, ${city.trim()}` : city.trim();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-bc-caramel/40 bg-bc-caramel/10 px-3 py-1 text-xs font-semibold text-bc-caramel ${className}`}
      title="Localização aproximada — você escolheu exibir"
    >
      <span aria-hidden>📍</span>
      O Caramelo está circulando por {place}
    </span>
  );
}
