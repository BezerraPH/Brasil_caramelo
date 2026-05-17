import { VIEW_MODES } from "@/lib/constants";

const FUTURE = [
  { icon: "💬", title: "Chats e grupos", phase: "Fase 3" },
  { icon: "📹", title: "Chamadas de voz e vídeo", phase: "Fase 4" },
  { icon: "📅", title: "Reuniões", phase: "Fase 4" },
  { icon: "🎮", title: "Jogo do cachorro", phase: "Fase 2" },
];

export function RoadmapPanel() {
  return (
    <aside className="space-y-4">
      <section className="rounded-xl border-2 border-bc-green/40 bg-bc-white p-4">
        <h2 className="mb-3 font-bold text-bc-green">Modos de visualização</h2>
        <ul className="space-y-2 text-sm">
          {VIEW_MODES.map((m) => (
            <li
              key={m.id}
              className={`rounded-lg px-3 py-2 ${
                m.available
                  ? "bg-bc-green/10 font-medium text-bc-green"
                  : "text-bc-brown/60"
              }`}
            >
              <span className="font-semibold">{m.label}</span>
              {!m.available && (
                <span className="ml-1 text-xs">(em breve)</span>
              )}
              <p className="text-xs opacity-80">{m.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border-2 border-bc-brown/30 bg-bc-white p-4">
        <h2 className="mb-3 font-bold text-bc-brown">Próximas fases</h2>
        <ul className="space-y-2 text-sm text-bc-brown">
          {FUTURE.map((f) => (
            <li key={f.title} className="flex gap-2">
              <span>{f.icon}</span>
              <span>
                <strong>{f.title}</strong>
                <span className="block text-xs opacity-70">{f.phase}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
