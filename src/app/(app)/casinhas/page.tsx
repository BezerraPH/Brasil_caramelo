import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { CASINHAS } from "@/lib/casinhas";

export default function CasinhasPage() {
  return (
    <PageContainer>
      <header className="mb-8 text-center bc-animate-in">
        <h1 className="text-3xl font-black text-bc-blue sm:text-4xl">Casinhas da Matilha</h1>
        <p className="mt-2 text-sm font-semibold text-bc-brown">
          Comunidades temáticas organizadas pela personalidade e vocação de cada raça
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CASINHAS.map((c, i) => (
          <div
            key={c.slug}
            className="bc-card bc-card-interactive bc-animate-in-up flex flex-col justify-between p-5 border border-bc-caramel/25 bg-bc-white/95 shadow-sm hover:border-bc-green"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bc-sand/40 text-3xl shadow-xs">
                  {c.emoji}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                  🟢 Ativa hoje
                </span>
              </div>

              <h2 className="mt-3 text-lg font-black text-bc-blue">
                {c.name}
              </h2>
              <p className="mt-1 text-xs font-semibold text-bc-brown">
                {c.tagline}
              </p>
              <p className="mt-2 text-xs text-bc-brown/80 line-clamp-2">
                {c.rules}
              </p>
            </div>

            <div className="mt-5 border-t border-bc-caramel/15 pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-bc-brown/70">
                🐾 Matilha aberta
              </span>
              <Link
                href={`/casinha/${c.slug}`}
                className="rounded-xl bg-gradient-to-r from-bc-green to-bc-caramel px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition"
              >
                Participar →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
