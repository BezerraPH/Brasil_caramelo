import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";

type TopTestimonial = {
  content: string;
  fromUser: {
    name: string;
    username: string;
    avatarUrl: string | null;
  };
};

/** Destaque Dono do Topo na coluna Orkut (R-ENG-05). */
export function ProfileOrkutTestimonialCrown({
  top,
}: {
  top: TopTestimonial | null;
}) {
  if (!top) return null;

  return (
    <section className="bc-orkut-card border-bc-gold/40 bg-gradient-to-br from-bc-gold/12 to-bc-caramel/8 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-bc-gold">
        👑 Dono do Topo
      </p>
      <div className="mt-2 flex items-start gap-2">
        <UserAvatar
          name={top.fromUser.name}
          avatarUrl={top.fromUser.avatarUrl}
          size="sm"
        />
        <div className="min-w-0">
          <Link
            href={`/perfil/${top.fromUser.username}`}
            className="text-sm font-semibold text-bc-blue hover:underline"
          >
            {top.fromUser.name}
          </Link>
          <p className="mt-1 line-clamp-3 text-xs italic text-bc-brown">
            &ldquo;{top.content}&rdquo;
          </p>
        </div>
      </div>
      <Link
        href="/depoimentos"
        className="mt-2 inline-block text-[10px] font-medium text-bc-blue hover:underline"
      >
        Ver todos os depoimentos →
      </Link>
    </section>
  );
}
