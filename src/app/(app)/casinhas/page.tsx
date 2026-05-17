import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { CASINHAS } from "@/lib/casinhas";

export default function CasinhasPage() {
  return (
    <PageContainer>
      <header className="mb-8 text-center bc-animate-in">
        <h1 className="text-3xl font-bold text-bc-blue">Casinhas da Matilha</h1>
        <p className="mt-2 text-bc-brown">
          Comunidades por personalidade — escolha sua toca
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CASINHAS.map((c, i) => (
          <Link
            key={c.slug}
            href={`/casinha/${c.slug}`}
            className={`bc-card bc-card-interactive bc-animate-in-up bg-gradient-to-br ${c.gradient} p-5`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="text-4xl">{c.emoji}</span>
            <h2 className="mt-2 text-lg font-bold" style={{ color: c.accent }}>
              {c.name}
            </h2>
            <p className="text-sm text-bc-brown">{c.tagline}</p>
            <p className="mt-2 text-xs text-bc-blue/80">{c.rules}</p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
