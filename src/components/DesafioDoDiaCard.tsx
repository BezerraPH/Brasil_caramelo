import Link from "next/link";
import { getDailyTopicChallenge } from "@/lib/daily-challenge";

/** Desafio de Tópico do Dia — pergunta que leva direto à Matilha. */
export function DesafioDoDiaCard() {
  const challenge = getDailyTopicChallenge();

  return (
    <section className="rounded-2xl border-2 border-bc-green/40 bg-gradient-to-br from-bc-green/5 to-bc-blue/5 p-4 shadow-sm">
      <h2 className="text-sm font-bold text-bc-green">📋 Desafio do Dia</h2>
      <p className="mt-2 text-sm leading-relaxed text-bc-brown">
        {challenge.question}
      </p>
      <Link
        href={`/matilhas/${challenge.packSlug}`}
        className="bc-btn-secondary mt-3 inline-flex text-xs"
      >
        Responder em {challenge.packName} →
      </Link>
    </section>
  );
}
