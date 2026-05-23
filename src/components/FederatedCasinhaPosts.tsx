import { getFederatedMirrorsForCasinha } from "@/lib/federation-import";
import type { DogReputationLevel } from "@/generated/prisma/enums";

type FederatedCasinhaPostsProps = {
  communityLevel: DogReputationLevel;
  casinhaName: string;
};

export async function FederatedCasinhaPosts({
  communityLevel,
  casinhaName,
}: FederatedCasinhaPostsProps) {
  const mirrors = await getFederatedMirrorsForCasinha(communityLevel, 8);
  if (mirrors.length === 0) return null;

  return (
    <section className="bc-federation-mirror bc-animate-in mb-6 p-5">
      <h2 className="font-bold text-bc-blue">🌐 Da matilha conectada</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Recados federados de outras instâncias — {casinhaName}
      </p>
      <ul className="mt-4 space-y-3">
        {mirrors.map((m, i) => (
          <li
            key={m.id}
            className="bc-animate-in-up rounded-xl border border-bc-caramel/20 bg-bc-white/80 p-3"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <p className="text-[10px] font-semibold text-bc-caramel">
              {m.peer.name} · @{m.authorUsername} ({m.authorName})
            </p>
            <p className="mt-1 text-sm text-bc-brown">
              {m.content || "—"}
            </p>
            <p className="mt-1 text-[10px] text-bc-brown/60">
              {new Date(m.sourceCreatedAt).toLocaleDateString("pt-BR")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
