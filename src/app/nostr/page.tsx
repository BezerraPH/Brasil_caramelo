import { getCurrentUser } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { NostrFeedView } from "@/components/nostr/NostrFeedView";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed Nostr Descentralizado — Brasil Caramelo",
  description: "Rede social descentralizada imutável transmitida via Nostr Relays.",
};

export default async function NostrStandalonePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-bc-sand text-bc-brown">
      {user ? (
        <NavBar
          user={user}
          pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
          pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
        />
      ) : (
        <header className="sticky top-0 z-40 border-b border-bc-caramel/20 bg-bc-white/95 px-4 py-3 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black text-bc-blue text-lg hover:opacity-90">
              <span className="text-2xl">🐕</span>
              <span>Brasil Caramelo</span>
              <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-xs font-bold text-amber-700">⚡ NOSTR</span>
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/entrar"
                className="rounded-lg border border-bc-caramel/40 px-3 py-1.5 font-medium text-bc-blue hover:bg-bc-cream transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-bc-green px-3 py-1.5 font-semibold text-bc-white hover:bg-bc-green-dark transition-colors shadow-xs"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="py-6">
        <NostrFeedView />
      </main>
    </div>
  );
}
