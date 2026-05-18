import Link from "next/link";
import { redirect } from "next/navigation";
import { AppVersionBadge } from "@/components/AppVersionBadge";
import { getCurrentUser } from "@/lib/auth";
import { getVersionLong } from "@/lib/app-version";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  return (
    <main className="bc-hero-bg bc-pattern-dots relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-bc-green/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-32 h-48 w-48 rounded-full bg-bc-caramel/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16">
        <div className="bc-animate-in-up text-center">
          <div className="bc-animate-float mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-bc-caramel/50 to-bc-green/40 text-6xl shadow-xl ring-4 ring-bc-white">
            🐕
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-bc-blue">Brasil </span>
            <span className="bc-shimmer-text">Caramelo</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-bc-brown">
            Feed, Insta, Cinelar, stories, casinhas e batalhas de fofura — a
            rede social que late em comunidade.
          </p>
          <p className="mt-4 flex justify-center">
            <AppVersionBadge showStage className="text-sm" />
          </p>
        </div>

        <div className="bc-animate-in bc-stagger-2 mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/cadastro"
            className="bc-btn-primary px-8 py-3 text-base shadow-lg"
          >
            Criar conta grátis
          </Link>
          <Link href="/entrar" className="bc-btn-secondary px-8 py-3 text-base">
            Já tenho conta
          </Link>
        </div>

        <div className="bc-animate-in bc-stagger-3 mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "💬", title: "Chat & Salas", desc: "DM, casinhas e chamadas" },
            { icon: "📰", title: "Feed & Casinhas", desc: "10 tocas por raça" },
            { icon: "🎬", title: "Cinelar", desc: "Shorts com autoplay" },
            { icon: "🐕", title: "Pet virtual", desc: "Cuidados e moedas" },
          ].map((f) => (
            <div
              key={f.title}
              className="bc-card bc-glass bc-card-interactive p-4 text-center"
            >
              <span className="text-3xl">{f.icon}</span>
              <p className="mt-2 font-bold text-bc-blue">{f.title}</p>
              <p className="text-xs text-bc-brown">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="bc-animate-in bc-stagger-4 mt-12 text-center text-xs text-bc-brown/80">
          {getVersionLong()} — em desenvolvimento ativo 🐾
        </p>
      </div>
    </main>
  );
}
