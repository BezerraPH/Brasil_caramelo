import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  return (
    <main className="bc-hero-bg bc-pattern-dots relative min-h-screen overflow-hidden">
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16">
        <div className="bc-animate-in-up text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-bc-caramel/40 to-bc-green/30 text-5xl shadow-lg ring-4 ring-bc-white">
            🐕
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-bc-blue sm:text-5xl">
            Brasil{" "}
            <span className="bg-gradient-to-r from-bc-brown to-bc-caramel bg-clip-text text-transparent">
              Caramelo
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-bc-brown">
            A rede social que se reinventa — Feed, personalidade canina, amigos e
            seu cachorro virtual.
          </p>
        </div>

        <div className="bc-animate-in bc-stagger-2 mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/cadastro" className="bc-btn-primary px-8 py-3 text-base shadow-lg">
            Criar conta grátis
          </Link>
          <Link href="/entrar" className="bc-btn-secondary px-8 py-3 text-base">
            Já tenho conta
          </Link>
        </div>

        <div className="bc-animate-in bc-stagger-3 mt-16 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {[
            { icon: "📰", title: "Feed", desc: "Recados e comunidade" },
            { icon: "🐾", title: "Personalidade P", desc: "10 vibes caninas" },
            { icon: "🎮", title: "Seu cachorro", desc: "Cuide todo dia" },
          ].map((f) => (
            <div
              key={f.title}
              className="bc-card bc-card-interactive p-4 text-center"
            >
              <span className="text-3xl">{f.icon}</span>
              <p className="mt-2 font-bold text-bc-blue">{f.title}</p>
              <p className="text-xs text-bc-brown">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
