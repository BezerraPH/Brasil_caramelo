import { VIEW_MODES } from "@/lib/constants";

const DONE = [
  { icon: "💬", title: "Chat DM + salas de casinha" },
  { icon: "📹", title: "Chamadas WebRTC" },
  { icon: "🎬", title: "Cinelar estilo TikTok + HLS" },
  { icon: "🌐", title: "Caramelo-Sync (federação LAN)" },
  { icon: "🌙", title: "Modo escuro" },
  { icon: "🔔", title: "Notificações ao vivo" },
  { icon: "🧬", title: "DNA Caramelo (cruzamento)" },
  { icon: "⚖️", title: "Tribunal do Cão (jurados + coins)" },
  { icon: "🛡️", title: "Cão de Guarda IA" },
  { icon: "🎙️", title: "Latidos ao Vivo (LiveKit + Tailscale)" },
  { icon: "🎬", title: "Cinelar For You (retenção + descoberta)", phase: "v2.19" },
  { icon: "📊", title: "Enquetes no topo da Matilha", phase: "v2.19" },
  { icon: "🇧🇷", title: "Brasil Moderno + Matilhas quentes", phase: "v2.20" },
  { icon: "👑", title: "Dono do Topo no perfil Orkut", phase: "v2.20" },
  { icon: "💳", title: "Pedigree PIX + Mercado Pago", phase: "v2.21" },
  { icon: "🎙️", title: "Latidos reações + sala da Matilha", phase: "v2.21" },
  { icon: "📱", title: "Banner instalar PWA", phase: "v2.21" },
  { icon: "🏪", title: "Pet shops — mapa por bairro", phase: "v2.22" },
  { icon: "📡", title: "WebRTC P2P vs TURN (debug)", phase: "v2.22" },
  { icon: "🔍", title: "Busca Meilisearch", phase: "v2.23" },
  { icon: "🔔", title: "Push PWA na tailnet", phase: "v2.23" },
  { icon: "⚡", title: "Redis + CI + backup ops", phase: "v2.24" },
  { icon: "📦", title: "MinIO / S3 para mídia", phase: "v2.25" },
  { icon: "🏘️", title: "Comunidades Orkut + export LGPD", phase: "v2.26" },
  { icon: "🌐", title: "Caramelo-Sync Tailscale + Capacitor", phase: "v2.27" },
  { icon: "🔒", title: "HTTPS / Tailscale / mkcert (CONFIGURACAO.md)" },
  { icon: "🌳", title: "Árvore genealógica DNA" },
  { icon: "🏪", title: "Cupons pet shop regional" },
];

/** Espelho dos itens P0/P1 de ROADMAP.md — atualizar ao marcar [x] no roadmap. */
const FUTURE: { icon: string; title: string; phase?: string }[] = [];

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

      <section className="bc-card border-bc-green/30 p-4">
        <h2 className="mb-2 font-bold text-bc-green">Roadmap V3 ✓</h2>
        <p className="text-xs text-bc-brown">
          P0–V3 concluídos — pronto para deploy. Novas ideias fora do{" "}
          <strong>ROADMAP.md</strong> entram como backlog separado.
        </p>
      </section>
    </aside>
  );
}
