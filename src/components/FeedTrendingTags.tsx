import Link from "next/link";
import { getMatilhaTrends } from "@/lib/trending";

export async function FeedTrendingTags() {
  const trends = await getMatilhaTrends(6);
  if (trends.length === 0) return null;

  return (
    <section className="bc-card bc-trending-sidebar bc-animate-in p-4">
      <h2 className="text-sm font-bold text-bc-blue">🔥 Trending</h2>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {trends.map((t) => (
          <li key={t.tag}>
            <Link
              href={`/buscar?tag=${encodeURIComponent(t.tag)}&tab=posts`}
              className="bc-trending-chip inline-block rounded-full bg-bc-green/10 px-2.5 py-0.5 text-[10px] font-semibold text-bc-green transition hover:bg-bc-green/20"
            >
              #{t.tag}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/explorar"
        className="mt-3 block text-[10px] font-medium text-bc-blue hover:underline"
      >
        Ver tudo em Explorar →
      </Link>
    </section>
  );
}
