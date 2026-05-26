import { getSorteDoDia } from "@/lib/constants";

export function SorteDoDiaCard() {
  const frase = getSorteDoDia();

  return (
    <section className="rounded-2xl border-2 border-bc-caramel/50 bg-gradient-to-br from-[#FFF8F0] to-bc-caramel/10 p-4 shadow-sm">
      <h2 className="text-sm font-bold text-bc-caramel">
        🐾 Biscoito de Sorte do Caramelo
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bc-brown italic">
        &ldquo;{frase}&rdquo;
      </p>
    </section>
  );
}
