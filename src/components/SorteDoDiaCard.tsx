import { getSorteDoDia } from "@/lib/constants";

export function SorteDoDiaCard() {
  const frase = getSorteDoDia();

  return (
    <section className="bc-luck-widget bc-animate-in" aria-label="Sorte do dia">
      <h2 className="bc-luck-widget-title">🍪 Biscoito de sorte</h2>
      <p className="bc-luck-widget-text">&ldquo;{frase}&rdquo;</p>
    </section>
  );
}
