import Link from "next/link";
import { EXPLORAR_HUB } from "@/lib/explorar-hub";

export function ExplorarHubGrid() {
  return (
    <div className="space-y-8">
      {EXPLORAR_HUB.map((section, sectionIdx) => (
        <section key={section.id} className="bc-hub-section bc-animate-in">
          <h2 className="bc-hub-section-title mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-bc-blue">
            <span aria-hidden>{section.emoji}</span>
            {section.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item, itemIdx) => {
              const d = sectionIdx * 3 + itemIdx;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bc-hub-tile bc-card bc-card-interactive bc-animate-in-up flex gap-3 p-4"
                  style={{ animationDelay: `${d * 0.04}s` }}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-bc-blue">{item.title}</p>
                    <p className="text-xs text-bc-brown">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
