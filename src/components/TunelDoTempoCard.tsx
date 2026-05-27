import Link from "next/link";
import type { MemoryPost } from "@/lib/memories";

type TunelDoTempoCardProps = {
  memory: MemoryPost;
};

export function TunelDoTempoCard({ memory }: TunelDoTempoCardProps) {
  const when = memory.createdAt.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="rounded-2xl border-2 border-bc-blue/20 bg-gradient-to-br from-bc-blue/5 to-bc-caramel/10 p-4">
      <h2 className="text-sm font-bold text-bc-blue">⏳ Túnel do Tempo</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Há 1 ano, em {when}
        {memory.packName ? `, na ${memory.packName}` : ""}, você postou:
      </p>
      <blockquote className="mt-2 rounded-lg bg-bc-white/80 px-3 py-2 text-sm italic text-bc-brown">
        {memory.content || "…"}
      </blockquote>
      <Link
        href={`/feed?post=${memory.id}`}
        className="mt-2 inline-block text-xs text-bc-blue hover:underline"
      >
        Ver recado →
      </Link>
    </section>
  );
}
