type ProfileMatilhaStatsProps = {
  postCount: number;
  friendCount: number;
  memberSince: Date;
  isPremium?: boolean;
};

function formatMemberSince(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function ProfileMatilhaStats({
  postCount,
  friendCount,
  memberSince,
  isPremium,
}: ProfileMatilhaStatsProps) {
  return (
    <dl className="bc-profile-stats bc-animate-in mt-4 grid grid-cols-3 gap-2 text-center">
      <div className="bc-profile-stat-cell">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-bc-brown">
          Recados
        </dt>
        <dd className="text-lg font-bold text-bc-blue">
          {postCount.toLocaleString("pt-BR")}
        </dd>
      </div>
      <div className="bc-profile-stat-cell">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-bc-brown">
          Amigos
        </dt>
        <dd className="text-lg font-bold text-bc-green">
          {friendCount.toLocaleString("pt-BR")}
        </dd>
      </div>
      <div className="bc-profile-stat-cell">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-bc-brown">
          Na matilha
        </dt>
        <dd className="text-xs font-semibold leading-tight text-bc-brown">
          {formatMemberSince(memberSince)}
        </dd>
      </div>
      {isPremium && (
        <p className="col-span-3 mt-1 text-center text-[10px] font-semibold text-bc-gold">
          ★ Pedigree — apoiador da matilha
        </p>
      )}
    </dl>
  );
}
