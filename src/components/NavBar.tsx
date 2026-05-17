import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type NavBarProps = {
  user: { name: string; username: string };
};

export function NavBar({ user }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-bc-blue/20 bg-bc-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/feed" className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bc-caramel/30 text-lg"
            aria-hidden
          >
            🐕
          </span>
          <span className="font-bold text-bc-blue">
            Brasil <span className="text-bc-brown">Caramelo</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium sm:gap-3">
          <Link
            href="/feed"
            className="rounded-lg px-2 py-1 text-bc-green hover:bg-bc-green/10"
          >
            Feed
          </Link>
          <Link
            href={`/perfil/${user.username}`}
            className="rounded-lg px-2 py-1 text-bc-blue hover:bg-bc-blue/10"
          >
            Perfil
          </Link>
          <Link
            href="/configuracoes"
            className="hidden rounded-lg px-2 py-1 text-bc-brown hover:bg-bc-brown/10 sm:inline"
          >
            Editar
          </Link>
          <span className="hidden text-bc-brown/40 sm:inline">|</span>
          <span className="hidden max-w-[100px] truncate text-bc-brown sm:inline">
            @{user.username}
          </span>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
