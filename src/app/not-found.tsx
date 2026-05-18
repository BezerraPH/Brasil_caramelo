import Link from "next/link";
import { AppVersionBadge } from "@/components/AppVersionBadge";

export default function NotFound() {
  return (
    <main className="bc-hero-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="bc-animate-float text-7xl">🐕‍🦺</p>
      <h1 className="mt-4 text-3xl font-bold text-bc-blue">Ops! Página perdida</h1>
      <p className="mt-2 max-w-sm text-bc-brown">
        Esse caminho não existe na matilha. Volte pro feed e continue o
        rolezinho.
      </p>
      <div className="bc-animate-in mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/feed" className="bc-btn-primary">
          Ir pro feed
        </Link>
        <Link href="/" className="bc-btn-secondary">
          Página inicial
        </Link>
      </div>
      <p className="mt-10">
        <AppVersionBadge />
      </p>
    </main>
  );
}
