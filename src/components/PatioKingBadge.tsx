type PatioKingBadgeProps = {
  className?: string;
};

export function PatioKingBadge({ className = "" }: PatioKingBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-bc-gold to-bc-caramel px-2 py-0.5 text-[10px] font-bold text-white shadow bc-patio-king-badge ${className}`}
      title="Rei do Pátio — venceu duelo nas últimas 24h"
    >
      👑 Rei do Pátio
    </span>
  );
}
