export function PremiumBadge({ compact }: { compact?: boolean }) {
  if (compact) {
    return <span className="bc-badge-premium ml-1">★</span>;
  }
  return <span className="bc-badge-premium">★ Pedigree</span>;
}
