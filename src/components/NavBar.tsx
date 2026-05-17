import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type NavBarProps = {
  user: { name: string; username: string };
};

export function NavBar({ user }: NavBarProps) {
  return (
    <header className="border-b-4 border-bc-blue bg-bc-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/feed" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🐕
          </span>
          <span className="font-bold text-bc-blue">
            Brasil <span className="text-bc-brown">Caramelo</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
          <Link href="/feed" className="text-bc-green hover:underline">
            Feed
          </Link>
          <Link
            href={`/perfil/${user.username}`}
            className="text-bc-blue hover:underline"
          >
            Meu perfil
          </Link>
          <span className="hidden text-bc-brown sm:inline">|</span>
          <span className="text-bc-brown">@{user.username}</span>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
