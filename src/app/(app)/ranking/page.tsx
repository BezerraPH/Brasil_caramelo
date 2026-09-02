import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { UserAvatar } from "@/components/UserAvatar";
import { REPUTATION_BY_LEVEL } from "@/lib/constants";
import { getAllPackRankings } from "@/lib/ranking";

export default async function RankingPage() {
  const rankings = await getAllPackRankings();

  return (
    <PageContainer>
      <header className="bc-page-header bc-animate-in mb-8 text-center">
        <h1 className="text-3xl font-black text-bc-blue sm:text-4xl">Ranking da Matilha</h1>
        <p className="mt-2 text-sm font-semibold text-bc-brown">
          Os membros mais reconhecidos em cada personalidade canina esta semana
        </p>
        <div className="mx-auto mt-4 max-w-lg rounded-2xl border border-bc-caramel/20 bg-bc-sand/20 p-3 text-xs font-semibold text-bc-brown">
          💡 <strong>Como funciona:</strong> Ao visitar o perfil de amigos ou reagir a posts, vote na personalidade que mais combina com eles para pontuar no ranking!
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {rankings.map(({ level, leaders }) => {
          const p = REPUTATION_BY_LEVEL[level];
          return (
            <section
              key={level}
              className="bc-card bc-animate-in-up overflow-hidden p-0 border border-bc-caramel/25 bg-bc-white shadow-sm"
            >
              <div className="border-b border-bc-caramel/20 bg-bc-sand/30 px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-black text-bc-blue">
                    <span className="text-xl">{p.emoji}</span>
                    {p.breed}
                  </h2>
                  <p className="text-xs font-semibold text-bc-brown">{p.vibe}</p>
                </div>
                <Link
                  href="/feed"
                  className="rounded-xl border border-bc-caramel/30 bg-bc-white px-2.5 py-1 text-[11px] font-bold text-bc-brown hover:bg-bc-green/10 hover:text-bc-green transition"
                >
                  Votar no Feed
                </Link>
              </div>

              <ol className="divide-y divide-bc-caramel/10">
                {leaders.length === 0 ? (
                  <li className="px-5 py-6 text-center text-xs font-semibold text-bc-brown">
                    Nenhum voto computado ainda esta semana — seja o primeiro a votar!
                  </li>
                ) : (
                  leaders.map((leader, i) => (
                    <li key={leader.userId}>
                      <Link
                        href={`/perfil/${leader.username}`}
                        className="flex items-center gap-3 px-5 py-3 transition hover:bg-bc-green/5"
                      >
                        <span className="w-6 text-center text-sm font-extrabold text-bc-caramel">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`}
                        </span>
                        <UserAvatar
                          name={leader.name}
                          avatarUrl={leader.avatarUrl}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1 truncate font-bold text-sm text-bc-blue">
                          {leader.name}
                        </span>
                        <span className="text-xs font-extrabold text-bc-green">
                          {leader.voteCount} voto{leader.voteCount !== 1 ? "s" : ""}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ol>
            </section>
          );
        })}
      </div>
    </PageContainer>
  );
}
