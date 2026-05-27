import Link from "next/link";

const ORKUT_MENU: {
  href: string;
  label: string;
  icon: string;
  soon?: boolean;
}[] = [
  { href: "/feed", label: "Recados", icon: "📝" },
  { href: "/matilhas", label: "Matilhas", icon: "🐾" },
  { href: "/amigos", label: "Amigos", icon: "👥" },
  { href: "/depoimentos", label: "Depoimentos", icon: "💬" },
  { href: "/fotos", label: "Fotos", icon: "📷" },
];

type ProfileOrkutSidebarMenuProps = {
  pendingFriends?: number;
};

export function ProfileOrkutSidebarMenu({
  pendingFriends = 0,
}: ProfileOrkutSidebarMenuProps) {
  return (
    <nav className="mt-4 border-t border-bc-blue/10 pt-3">
      <ul className="space-y-0.5">
        {ORKUT_MENU.map((item) => (
          <li key={item.href}>
            {item.soon ? (
              <span className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-bc-brown/50">
                <span aria-hidden>{item.icon}</span>
                {item.label}
                <span className="ml-auto text-[10px]">em breve</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-bc-brown transition hover:bg-bc-caramel/10 hover:text-bc-blue"
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
                {item.label === "Amigos" && pendingFriends > 0 && (
                  <span className="ml-auto rounded-full bg-bc-caramel px-2 py-0.5 text-[10px] font-bold text-white">
                    {pendingFriends}
                  </span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
