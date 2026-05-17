import { VIEW_MODES } from "@/lib/constants";

const DONE = [
  { icon: "💾", title: "Mídia no seu servidor" },
  { icon: "⭕", title: "Stories com visto" },
  { icon: "🔖", title: "Recados salvos" },
  { icon: "🎁", title: "Missão diária do pet" },
  { icon: "↗", title: "Compartilhar e apagar posts" },
];

const FUTURE = [
  { icon: "💬", title: "Chats em tempo real", phase: "Fase 3" },
  { icon: "📹", title: "Chamadas de voz e vídeo", phase: "Fase 4" },
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
              className="rounded-lg bg-bc-green/10 px-3 py-2 font-medium text-bc-green"
            >
              <span className="font-semibold">{m.label}</span>
              <span className="ml-1 block text-xs opacity-80">{m.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bc-card p-4">
        <h2 className="mb-3 font-bold text-bc-blue">v1.2 — Novidades</h2>
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
