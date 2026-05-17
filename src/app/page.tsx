import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bc-white via-bc-white to-bc-green/10 px-4">
      <div className="max-w-lg text-center">
        <p className="text-6xl" aria-hidden>
          🐕
        </p>
        <h1 className="mt-4 text-4xl font-bold text-bc-blue">
          Brasil <span className="text-bc-brown">Caramelo</span>
        </h1>
        <p className="mt-3 text-bc-brown">
          Uma rede social que se apresenta de várias formas — começando pelo
          modo Feed, no espírito das comunidades brasileiras online.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/cadastro"
            className="rounded-xl bg-bc-green px-6 py-3 font-semibold text-white shadow-md transition hover:bg-bc-green/90"
          >
            Criar conta
          </Link>
          <Link
            href="/entrar"
            className="rounded-xl border-2 border-bc-blue px-6 py-3 font-semibold text-bc-blue transition hover:bg-bc-blue hover:text-white"
          >
            Entrar
          </Link>
        </div>
        <ul className="mt-10 space-y-2 text-left text-sm text-bc-brown">
          <li>🐾 Personalidade canina nos perfis (Poodle, Pitbull, Vira-lata…)</li>
          <li>📰 Modo Feed ativo — Insta e Reels em breve</li>
          <li>🎮 Jogo do cachorro, chats e chamadas no roadmap</li>
        </ul>
      </div>
    </main>
  );
}
