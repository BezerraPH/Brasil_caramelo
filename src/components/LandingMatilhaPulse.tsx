import { getMatilhaStats } from "@/lib/matilha-stats";

export async function LandingMatilhaPulse() {
  const stats = await getMatilhaStats();

  const items = [
    { label: "Caramels", value: stats.users, icon: "🐕" },
    { label: "Recados", value: stats.posts, icon: "📰" },
    { label: "Pets", value: stats.pets, icon: "🦴" },
  ];

  return (
    <div className="bc-landing-pulse bc-animate-in bc-stagger-2 mt-10 flex flex-wrap justify-center gap-4">
      {items.map((item, i) => (
        <div
          key={item.label}
          className="bc-landing-stat rounded-2xl border border-bc-blue/15 bg-bc-white/80 px-5 py-3 text-center shadow-sm backdrop-blur-sm"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <span className="block text-xl" aria-hidden>
            {item.icon}
          </span>
          <p className="mt-1 text-lg font-bold text-bc-blue">
            {item.value.toLocaleString("pt-BR")}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-bc-brown">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
