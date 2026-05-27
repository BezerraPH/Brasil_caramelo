# Brasil Caramelo — Roadmap (checklist)

**Fonte única de tarefas planejadas.** Marque `[x]` ao concluir cada item.

## Regra para humanos e IA (não pular)

Ao **começar** um item: opcionalmente anote `→ em progresso` na linha.  
Ao **concluir**:

1. Troque `[ ]` por `[x]` neste arquivo (adicione data `YYYY-MM-DD` e ID da versão, ex. `v2.19.0`).
2. Atualize **`Versions.txt`**: instruções no topo, seção **ROADMAP (resumo)**, **FUNCIONALIDADES ATUAIS** e **HISTÓRICO DE VERSÕES**.
3. Se for entrega de produto: incremente **`package.json`** e alinhe **`src/lib/app-version.ts`**.
4. Se o item estiver em **Em breve** na UI: atualize **`src/components/RoadmapPanel.tsx`**.

Legenda de prioridade: **P0** crítico / próximo sprint · **P1** alto valor · **P2** polish · **P3** infra / futuro

---

## Resumo rápido

| Prioridade | Total | Concluídos |
|------------|------:|-----------:|
| P0         | 4     | 4          |
| P1         | 15    | 10         |
| P2         | 8     | 2          |
| P3         | 6     | 0          |

*Atualize a tabela ao marcar itens.*

---

## P0 — Próximo sprint (produto)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-019-01 | **Cinelar FYP** — ranking por retenção (watch time, conclusão), sinais de interação, pool “descoberta” + amigos; modelos `PostInteraction` / score | v2.19 | [x] 2026-05-22 |
| R-019-02 | **Triângulo modos** — enquete visível no feed/resumo da Matilha (não só na página do tópico) | v2.19 | [x] 2026-05-22 |
| R-019-03 | **Triângulo modos** — mini-grid “últimas fotos” no perfil Orkut (sidebar) ligado a `/fotos` | v2.19 | [x] 2026-05-22 |
| R-019-04 | **Triângulo modos** — graus de amizade (Fã / Amigo / Melhor amigo) pesam na Fila do Pão de Queijo e no quintal | v2.19 | [x] 2026-05-22 |

---

## P1 — Produto e monetização

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-UI-01 | **Visual Brasil Moderno** — alinhar perfil Orkut ao mock `example_template/new_orkut.html` (paleta, scraps, navbar sticky, reputação em pills/barras) | v2.20 | [x] 2026-05-22 |
| R-MON-01 | **Pedigree Pix real** — gateway (MP/Stripe) + webhook em `/api/premium/webhook` (hoje stub) | v2.21 | [ ] |
| R-MON-02 | **Pet shops parceiros** — cupons reais + mapa por cidade/bairro (aproveitar radar v2.15) | v2.22 | [ ] |
| R-ENG-01 | Notificação: enquete da Matilha encerrando / resultado disponível | v2.20 | [x] 2026-05-22 |
| R-ENG-02 | Notificação: depoimento aceito / novo depoimento pendente (reforço inbox) | v2.20 | [x] 2026-05-22 |
| R-ENG-03 | Notificação: RSVP / lembrete de encontro da Matilha | v2.20 | [x] 2026-05-22 |
| R-ENG-04 | **Tópicos quentes** em `/matilhas` (atividade recente, além de sort membros/novas) | v2.20 | [x] 2026-05-22 |
| R-ENG-05 | **Dono do Topo** — destaque público no perfil Orkut (depoimentos) | v2.20 | [x] 2026-05-22 |
| R-ENG-06 | **Cápsula do tempo** — cron/Pusher quando `capsuleReleaseAt` vencer | v2.20 | [x] 2026-05-22 |
| R-ENG-07 | **Radar de localização** — duplo opt-in e copy de privacidade na UI | v2.20 | [x] 2026-05-22 |
| R-UI-02 | **RoadmapPanel** — listar itens P0/P1 reais; remover “Em breve” obsoleto | v2.19 | [x] 2026-05-22 |
| R-INF-01 | **Busca Meilisearch** — substituir/ complementar busca SQL (pessoas, recados, tags) | v2.23 | [ ] |

---

## P1 — Experiência ao vivo (diferencial)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-LIVE-01 | **Latidos** — reações rápidas de áudio (“levantar a pata”) na sala | v2.21 | [ ] |
| R-LIVE-02 | **LiveKit × Matilha** — link da sala ao RSVP do encontro (um clique do evento) | v2.21 | [ ] |
| R-LIVE-03 | **WebRTC** — indicador P2P vs TURN (modo debug / configurações avançadas) | v2.22 | [ ] |

---

## P2 — PWA e polish

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-PWA-01 | PWA: banner “Instalar app” mais visível + ícones/splash completos | v2.22 | [ ] |
| R-PWA-02 | PWA: push na tailnet (opcional, via service worker + endpoint) | v2.23 | [ ] |
| R-UI-03 | Landing alinhada ao que está no ar (Matilhas, depoimentos, álbuns, enquetes) | v2.20 | [x] 2026-05-22 |
| R-UI-04 | `/explorar` — hub atualizado com links v2.15–v2.18 | v2.20 | [x] 2026-05-22 |
| R-UI-05 | Sorte do Dia — widget estilo mock (card minimalista) | v2.20 | [x] 2026-05-22 |
| R-UI-06 | Reputação no perfil — barras/pills “Sexy / Confiável / Legal” (mock Orkut) | v2.20 | [x] 2026-05-22 |
| R-DOC-01 | `CONFIGURACAO.md` — troubleshooting deploy Tailscale (nginx 8780) | v2.18 | [x] 2026-05-22 |
| R-DOC-02 | Script `scripts/fix-nginx-tailscale.sh` + deploy Docker antes do nginx | v2.18 | [x] 2026-05-22 |

---

## P3 — Infra, qualidade e ops

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-OPS-01 | **Testes** — smoke de APIs críticas (auth, posts, upload, health) no CI | v2.24 | [ ] |
| R-OPS-02 | **Redis** — cache Matilhas, rate limit, estado quente do pet (nota v2.13) | v2.24 | [ ] |
| R-OPS-03 | **Observabilidade** — métricas/log: falhas HLS, fila offline, erros LiveKit | v2.24 | [ ] |
| R-OPS-04 | **Backup** — cron `pg_dump` + snapshot `data/uploads` no servidor | v2.24 | [ ] |
| R-INF-02 | **MinIO** (opcional) — object storage para mídia (ver sugestões infra) | v3.x | [ ] |
| R-INF-03 | HTTPS LAN (mkcert) documentado como alternativa ao Tailscale-only | — | [ ] já suportado; marcar [x] quando não for mais “pendente” confuso |

---

## Concluídos recentemente (referência)

| Versão | Entrega |
|--------|---------|
| v2.20 | Brasil Moderno UI, Matilhas quentes, notificações engajamento, Dono do Topo |
| v2.19 | Cinelar FYP, enquetes feed Matilha, fotos Orkut, graus na fila |
| v2.18 | Enquetes Matilha, graus de amizade, filtros `/matilhas` |
| deploy | `fix-nginx-tailscale.sh`, `bc_install_tunnel_origin_nginx` |

---

## Ideias futuras (backlog sem prioridade)

- [ ] Modo “Communities” estilo Orkut clássico (temas por comunidade)
- [ ] Exportar scrapbook / GDPR dump de dados do usuário
- [ ] Federação Caramelo-Sync entre servidores Tailscale (não só LAN)
- [ ] App nativo (Capacitor) reutilizando PWA

---

*Última revisão do roadmap: 2026-05-22 · versão de referência do app: v2.20.0-alpha.0*
