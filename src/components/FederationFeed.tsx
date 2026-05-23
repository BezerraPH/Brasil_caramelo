import Link from "next/link";
import { getRecentFederatedMirrors } from "@/lib/federation-import";
import { CASINHAS } from "@/lib/casinhas";

export async function FederationFeed() {
  const mirrors = await getRecentFederatedMirrors(8);
  if (mirrors.length === 0) return null;

  const slugByLevel = Object.fromEntries(
    CASINHAS.map((c) => [c.level, c.slug]),
  );

  return (
    <section className="bc-card bc-animate-in bc-federation-panel mt-8 border-bc-blue/20 p-5">
      <h2 className="font-bold text-bc-blue">🌐 Matilha conectada (LAN)</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Recados de casinhas em outros servidores Brasil Caramelo
      </p>
      <ul className="mt-4 space-y-3">
        {mirrors.map((m, i) => {
          const slug = slugByLevel[m.communityLevel];
          return (
            <li
              key={m.id}
              className="bc-federation-mirror bc-animate-in-up rounded-xl border border-bc-blue/10 bg-gradient-to-br from-bc-cream/80 to-bc-white p-3"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <p className="text-[10px] font-semibold text-bc-caramel">
                {m.peer.name} · @{m.authorUsername}
              </p>
              <p className="mt-1 line-clamp-3 text-sm text-bc-brown">
                {m.content || "—"}
              </p>
              {slug && (
                <Link
                  href={`/casinha/${slug}`}
                  className="mt-2 inline-block text-xs font-medium text-bc-blue hover:underline"
                >
                  Ver casinha local →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <Link
        href="/configuracoes"
        className="mt-4 block text-center text-xs text-bc-brown hover:text-bc-blue"
      >
        Gerenciar peers em configurações
      </Link>
    </section>
  );
}
