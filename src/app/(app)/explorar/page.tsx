import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";
import { CASINHAS } from "@/lib/casinhas";

const HUB = [
  { href: "/feed", icon: "📰", title: "Feed & Cinelar", desc: "Recados, Insta e Shorts" },
  { href: "/casinhas", icon: "🏠", title: "Casinhas", desc: "10 comunidades por raça" },
  { href: "/ranking", icon: "🏆", title: "Ranking", desc: "Top da semana" },
  { href: "/batalha", icon: "⚔️", title: "Batalha", desc: "Votação de fofura" },
  { href: "/rolezinho", icon: "🎉", title: "Rolezinho", desc: "Eventos 2x moedas" },
  { href: "/cachorro", icon: "🐕", title: "Meu pet", desc: "Cuidar e loja" },
  { href: "/amigos", icon: "🤝", title: "Amigos", desc: "Matilha social" },
  { href: "/mensagens", icon: "💬", title: "Mensagens", desc: "Chat ao vivo com amigos" },
  { href: "/buscar", icon: "🔍", title: "Buscar", desc: "Pessoas, recados e #tags" },
  { href: "/notificacoes", icon: "🔔", title: "Notificações", desc: "Tudo da matilha" },
  { href: "/salvos", icon: "🔖", title: "Salvos", desc: "Recados favoritos" },
  { href: "/premium", icon: "👑", title: "Pedigree", desc: "Apoiar o projeto" },
];

export default async function ExplorarPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <PageContainer>
      <header className="mb-8 text-center bc-animate-in">
        <h1 className="text-3xl font-bold text-bc-blue">Explorar</h1>
        <p className="mt-2 text-bc-brown">Tudo que o Brasil Caramelo oferece</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HUB.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="bc-card bc-card-interactive bc-animate-in-up flex gap-3 p-4"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-bold text-bc-blue">{item.title}</p>
              <p className="text-xs text-bc-brown">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="bc-card mt-8 p-5">
        <h2 className="mb-3 font-bold text-bc-blue">Casinhas em destaque</h2>
        <div className="flex flex-wrap gap-2">
          {CASINHAS.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/casinha/${c.slug}`}
              className="rounded-full border border-bc-blue/20 bg-bc-white px-3 py-1 text-xs font-medium text-bc-blue hover:bg-bc-green/10"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
