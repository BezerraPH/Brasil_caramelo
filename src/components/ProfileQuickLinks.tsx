import Link from "next/link";

const LINKS = [
  { href: "/feed", icon: "📰", label: "Feed" },
  { href: "/cachorro", icon: "🐕", label: "Pet" },
  { href: "/depoimentos", icon: "💬", label: "Depoimentos" },
  { href: "/matilhas", icon: "🐾", label: "Matilhas" },
  { href: "/comunidades", icon: "🏘️", label: "Comunidades" },
  { href: "/explorar", icon: "🧭", label: "Explorar" },
  { href: "/configuracoes", icon: "⚙️", label: "Editar" },
] as const;

export function ProfileQuickLinks() {
  return (
    <nav
      className="bc-profile-quick bc-animate-in mt-4 flex flex-wrap gap-2"
      aria-label="Atalhos do perfil"
    >
      {LINKS.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          className="bc-profile-quick-link"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
