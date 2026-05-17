import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { UserAvatar } from "@/components/UserAvatar";
import { REPUTATION_BY_LEVEL } from "@/lib/constants";
import { getAllPackRankings } from "@/lib/ranking";

export default async function RankingPage() {
  const rankings = await getAllPackRankings();

  return (
    <PageContainer>
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-bc-blue">Ranking da Matilha</h1>
        <p className="mt-2 text-bc-brown">
          Top 10 da semana em cada personalidade — quem mais recebeu votos
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {rankings.map(({ level, leaders }) => {
          const p = REPUTATION_BY_LEVEL[level];
          return (
            <section
              key={level}
              className="bc-card bc-animate-in-up overflow-hidden p-0"
            >
              <div
                className="border-b-2 px-5 py-4"
                style={{ borderColor: "var(--bc-personality-border, #1b6ca8)" }}
              >
                <h2 className="flex items-center gap-2 text-lg font-bold text-bc-blue">
                  <span>{p.emoji}</span>
                  {p.breed}
                </h2>
                <p className="text-xs text-bc-brown">{p.vibe}</p>
              </div>
              <ol className="divide-y divide-bc-blue/5">
                {leaders.length === 0 ? (
                  <li className="px-5 py-6 text-center text-sm text-bc-brown">
                    Nenhum voto esta semana — seja o primeiro!
                  </li>
                ) : (
                  leaders.map((leader, i) => (
                    <li key={leader.userId}>
                      <Link
                        href={`/perfil/${leader.username}`}
                        className="flex items-center gap-3 px-5 py-3 transition hover:bg-bc-green/5"
                      >
                        <span className="w-6 text-center text-sm font-bold text-bc-caramel">
                          {i + 1}
                        </span>
                        <UserAvatar
                          name={leader.name}
                          avatarUrl={leader.avatarUrl}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1 truncate font-medium text-bc-blue">
                          {leader.name}
                        </span>
                        <span className="text-xs font-semibold text-bc-green">
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
