import { VIEW_MODES } from "@/lib/constants";

const DONE = [
  { icon: "💬", title: "Comentários nos recados" },
  { icon: "🤝", title: "Amigos e pedidos" },
  { icon: "🔍", title: "Buscar pessoas" },
  { icon: "🐕", title: "Jogo do cachorro" },
];

const FUTURE = [
  { icon: "📹", title: "Chamadas de voz e vídeo", phase: "Fase 4" },
  { icon: "💬", title: "Chats em tempo real", phase: "Fase 3" },
  { icon: "📅", title: "Reuniões", phase: "Fase 4" },
];

export function RoadmapPanel() {
  return (
    <aside className="space-y-4">
      <section className="bc-card p-4">
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
              {!m.available && <span className="ml-1 text-xs">(em breve)</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="bc-card p-4">
        <h2 className="mb-3 font-bold text-bc-blue">Novo nesta versão</h2>
        <ul className="space-y-2 text-sm text-bc-brown">
          {DONE.map((f) => (
            <li key={f.title} className="flex gap-2">
              <span>{f.icon}</span>
              <span>{f.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bc-card p-4">
        <h2 className="mb-3 font-bold text-bc-brown">Em breve</h2>
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
