type FoundingMemberBadgeProps = {
  className?: string;
};

export function FoundingMemberBadge({ className = "" }: FoundingMemberBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-bc-gold/20 px-2 py-0.5 text-[10px] font-bold text-bc-gold ring-1 ring-bc-gold/40 ${className}`}
      title="Membro Fundador — entrou na fase ALPHA da matilha"
    >
      🐾 001
    </span>
  );
}
