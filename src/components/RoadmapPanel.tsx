import { VIEW_MODES } from "@/lib/constants";

const DONE = [
  { icon: "💬", title: "Chat DM + salas de casinha" },
  { icon: "📹", title: "Chamadas WebRTC" },
  { icon: "🎬", title: "Cinelar estilo TikTok + HLS" },
  { icon: "🌐", title: "Caramelo-Sync (federação LAN)" },
  { icon: "🌙", title: "Modo escuro" },
  { icon: "🔔", title: "Notificações ao vivo" },
  { icon: "🏆", title: "Conquistas com toast" },
];

const FUTURE = [
  { icon: "🌐", title: "TURN / coturn no servidor", phase: "Ver COTURN.md" },
  { icon: "🎥", title: "LiveKit — salas grandes", phase: "Roadmap" },
  { icon: "🛡️", title: "Moderação IA de imagens", phase: "Em estudo" },
  { icon: "💳", title: "Pagamento Pedigree (Pix real)", phase: "Integração" },
  { icon: "🏪", title: "Pet shops geolocalizados", phase: "Stub em /premium" },
];

export function RoadmapPanel() {
  return (
    <aside className="space-y-4">
      <section className="bc-card p-4">
        <h2 className="mb-3 font-bold text-bc-green">Modos</h2>
        <ul className="space-y-2 text-sm">
          {VIEW_MODES.map((m) => (
            <li
              key={m.id}
              className="rounded-lg bg-bc-green/10 px-3 py-2 font-medium text-bc-green"
            >
              {m.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="bc-card p-4">
        <h2 className="mb-3 font-bold text-bc-blue">Já no ar</h2>
        <ul className="space-y-2 text-sm text-bc-brown">
          {DONE.map((f) => (
            <li key={f.title} className="flex gap-2 bc-animate-in">
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
