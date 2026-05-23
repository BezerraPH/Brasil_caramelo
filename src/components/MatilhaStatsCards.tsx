import Link from "next/link";
import { getMatilhaStats } from "@/lib/matilha-stats";
import { MATILHA_STAT_ITEMS } from "@/lib/matilha-stat-items";

const SIDEBAR_BG: Record<string, string> = {
  users: "bg-bc-blue/5",
  posts: "bg-bc-green/5",
  pets: "bg-bc-brown/5",
  boosted: "bg-bc-caramel/10",
  mirrors: "bg-bc-gold/10",
};

type MatilhaStatsCardsProps = {
  layout?: "strip" | "sidebar";
};

export async function MatilhaStatsCards({ layout = "strip" }: MatilhaStatsCardsProps) {
  const stats = await getMatilhaStats();

  if (layout === "sidebar") {
    return (
      <section className="bc-card bc-animate-in p-4">
        <h2 className="text-sm font-bold text-bc-blue">Pulse da matilha</h2>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
          {MATILHA_STAT_ITEMS.map((item) => (
            <div
              key={item.key}
              className={`rounded-lg px-2 py-2 ${SIDEBAR_BG[item.key] ?? "bg-bc-blue/5"}`}
            >
              <dt className="text-[10px] text-bc-brown">{item.label}</dt>
              <dd className={`text-lg font-bold ${item.colorClass}`}>
                {stats[item.key].toLocaleString("pt-BR")}
              </dd>
            </div>
          ))}
        </dl>
        {stats.mirrors > 0 && (
          <Link
            href="/explorar"
            className="mt-3 block text-center text-xs font-medium text-bc-blue hover:underline"
          >
            Ver matilha conectada →
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="bc-animate-in mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {MATILHA_STAT_ITEMS.map((item, i) => (
        <div
          key={item.key}
          className="bc-card bc-stat-pulse p-4 text-center"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <p className="text-2xl" aria-hidden>
            {item.icon}
          </p>
          <p className={`mt-1 text-xl font-bold ${item.colorClass}`}>
            {stats[item.key].toLocaleString("pt-BR")}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-bc-brown">
            {item.label}
          </p>
        </div>
      ))}
    </section>
  );
}
