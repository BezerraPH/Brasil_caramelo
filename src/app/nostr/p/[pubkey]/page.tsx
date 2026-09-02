import { getCurrentUser } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { NostrUserProfileView } from "@/components/nostr/NostrUserProfileView";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    pubkey: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Perfil Nostr ${resolvedParams.pubkey.slice(0, 10)} — Brasil Caramelo`,
    description: "Perfil descentralizado e notas transmitidas via Nostr.",
  };
}

export default async function NostrProfilePage({ params }: Props) {
  const resolvedParams = await params;
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
        <NostrUserProfileView rawPubkeyOrNpub={resolvedParams.pubkey} />
      </main>
    </div>
  );
}
