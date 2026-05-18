import Link from "next/link";
import { getMatilhaTrends } from "@/lib/trending";

export async function TrendingCloud() {
  const trends = await getMatilhaTrends(18);

  if (trends.length === 0) {
    return (
      <p className="text-sm text-bc-brown">
        Ainda sem tendências — poste com #hashtags na matilha!
      </p>
    );
  }

  const max = trends[0]?.count ?? 1;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {trends.map((t, i) => {
        const scale = 0.75 + (t.count / max) * 0.5;
        return (
          <Link
            key={t.tag}
            href={`/buscar?q=${encodeURIComponent(`#${t.tag}`)}`}
            className="bc-animate-in rounded-full border border-bc-blue/15 bg-bc-white px-3 py-1 font-medium text-bc-blue transition hover:border-bc-caramel hover:bg-bc-caramel/10"
            style={{
              fontSize: `${Math.round(11 + scale * 5)}px`,
              animationDelay: `${i * 0.03}s`,
            }}
            title={`${t.count} menções na semana`}
          >
            #{t.tag}
          </Link>
        );
      })}
    </div>
  );
}
