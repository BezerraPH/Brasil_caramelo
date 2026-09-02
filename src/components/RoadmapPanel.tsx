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
  { icon: "🏘️", title: "Comunidades: criar comunidade, fórum, mural, mods, ranking", phase: "v2.30" },
  { icon: "💳", title: "Pedigree admin PIX manual", phase: "v2.29" },
  { icon: "⚡", title: "Nostr: feed descentralizado, chaves Schnorr, zaps, QR code", phase: "v2.30" },
  { icon: "🔒", title: "Nostr: chat privado criptografado E2E (NIP-04) + seguir matilha (NIP-02)", phase: "v2.31" },
  { icon: "🐾", title: "Nostr: feed exclusivo de seguidos + detecção HTTPS seguro", phase: "v2.31" },
  { icon: "📖", title: "Nostr: manuais caninos e artigos long-form (NIP-23)", phase: "v2.32" },
  { icon: "🔒", title: "HTTPS / Tailscale / mkcert (CONFIGURACAO.md)" },
  { icon: "🌳", title: "Árvore genealógica DNA" },
  { icon: "🏪", title: "Cupons pet shop regional" },
];

/** Próximos itens de ROADMAP.md (onda v2.33+) — atualizar ao marcar [x]. */
const FUTURE: { icon: string; title: string; phase?: string }[] = [
  { icon: "💬", title: "Scrapbook com threads em depoimentos", phase: "v2.33" },
  { icon: "📌", title: "Recado fixado no perfil Orkut", phase: "v2.33" },
  { icon: "🔄", title: "Federação: sync agendado e preview", phase: "v2.33" },
  { icon: "🧪", title: "Testes Vitest + Playwright", phase: "P3" },
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

      {FUTURE.length > 0 && (
        <section className="bc-card border-bc-yellow/40 p-4">
          <h2 className="mb-3 font-bold text-bc-blue">Em breve (v2.28+)</h2>
          <ul className="space-y-2 text-sm text-bc-brown">
            {FUTURE.map((f) => (
              <li key={f.title} className="flex gap-2">
                <span>{f.icon}</span>
                <span>
                  {f.title}
                  {f.phase ? (
                    <span className="ml-1 text-xs text-bc-brown/70">({f.phase})</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bc-card border-bc-green/30 p-4">
        <h2 className="mb-2 font-bold text-bc-green">Roadmap</h2>
        <p className="text-xs text-bc-brown">
          Detalhes em <strong>ROADMAP.md</strong> — onda v2.28+ em andamento.
        </p>
      </section>
    </aside>
  );
}
