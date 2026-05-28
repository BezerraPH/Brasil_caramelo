# Brasil Caramelo — Roadmap (checklist)

**Fonte única de tarefas planejadas.** Marque `[x]` ao concluir cada item.

## Regra para humanos e IA (não pular)

Ao **começar** um item: opcionalmente anote `→ em progresso` na linha.  
Ao **concluir**:

1. Troque `[ ]` por `[x]` neste arquivo (adicione data `YYYY-MM-DD` e ID da versão).
2. Atualize **`Versions.txt`**: instruções no topo, seção **ROADMAP (resumo)**, **FUNCIONALIDADES ATUAIS** e **HISTÓRICO DE VERSÕES**.
3. Se for entrega de produto: incremente **`package.json`** e **`src/lib/app-version.ts`**.
4. Se o item aparecer na UI: atualize **`src/components/RoadmapPanel.tsx`**.

Legenda: **P0** crítico / deploy · **P1** alto valor · **P2** polish · **P3** infra · **V4** onda v2.28+

---

## Resumo rápido — onda v2.28+

| Prioridade | Total | Concluídos |
|------------|------:|-----------:|
| P0 — Ativar stack | 10 | 10 |
| P1 — Comunidades | 6 | 5 |
| P1 — Social & descoberta | 7 | 0 |
| P1 — Monetização | 3 | 2 |
| P1 — Federação 2.0 | 4 | 0 |
| P2 — Mobile | 5 | 0 |
| P2 — UX | 5 | 0 |
| P3 — Infra & segurança | 7 | 2 |
| P3 — Qualidade (testes) | 4 | 0 |

**Foco atual:** P1 Comunidades (`R-COM-05` criar comunidade) · P1 Social · P3 testes.

---

## P0 — Ativar o que já existe no servidor (v2.28)

Checklist de **produção** — scripts e doc prontos; configure `.env` no host antes do deploy.

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-028-01 | **Premium** — `PREMIUM_WEBHOOK_SECRET`, `PEDIGREE_PIX_KEY`, `MERCADOPAGO_ACCESS_TOKEN` + doc CONFIGURACAO §18 | v2.28 | [x] 2026-05-22 |
| R-028-02 | **Push PWA** — gerar `VAPID_*` (`generate-vapid-keys.sh`) e validar `/api/push/vapid` | v2.28 | [x] 2026-05-22 |
| R-028-03 | **Meilisearch** — `MEILISEARCH_*` ativo + cron/doc reindex (`/api/search/reindex`) | v2.28 | [x] 2026-05-22 |
| R-028-04 | **MinIO** — `S3_*` + `setup-minio-bucket.sh` no deploy `--full` | v2.28 | [x] 2026-05-22 |
| R-028-05 | **Redis** — `REDIS_URL` no `.env` prod + chip saúde em Explorar | v2.28 | [x] 2026-05-22 |
| R-028-06 | **Ollama** (opcional) — `OLLAMA_BASE_URL` + doc Cão de Guarda local | v2.28 | [x] 2026-05-22 |
| R-028-07 | **Smoke autenticado** — `BC_SMOKE_*` via `setup-smoke-account.sh` | v2.28 | [x] 2026-05-22 |
| R-028-08 | **Smoke Tailscale** — SKIP portas 443/7443/6443 quando `tailscale serve` ativo | v2.28 | [x] 2026-05-22 |
| R-028-09 | **Deploy** — smoke com falha não derruba stack (aviso + curl health) | v2.28 | [x] 2026-05-22 |
| R-028-10 | **Script** `check-production-env.sh` — audita `.env` e lista o que falta (P0) | v2.28 | [x] 2026-05-22 |

---

## P1 — Comunidades Orkut (profundidade)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-COM-01 | **Fórum** — tópicos e respostas dentro de `/comunidades/[slug]` | v2.28 | [x] 2026-05-22 |
| R-COM-02 | **Moderadores** — dono/mod, regras fixadas no topo | v2.29 | [x] 2026-05-22 |
| R-COM-03 | **Mural** — recados só da comunidade (feed scoped) | v2.29 | [x] 2026-05-22 |
| R-COM-04 | **Ranking** — comunidades quentes (membros + atividade) | v2.29 | [x] 2026-05-22 |
| R-COM-05 | **Criar comunidade** — formulário usuário + moderação leve | v2.29 | [ ] |
| R-COM-06 | **Explorar** — busca e filtro por categoria na UI | v2.29 | [x] 2026-05-22 |

---

## P1 — Social, perfil e descoberta

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-SOC-01 | **Scrapbook** — comentários/respostas em depoimentos (thread) | v2.29 | [ ] |
| R-SOC-02 | **Álbuns** — permissões amigos / matilha / público | v2.29 | [ ] |
| R-SOC-03 | **Recado fixado** — “recado do dia” no topo do perfil Orkut | v2.29 | [ ] |
| R-SOC-04 | **Visitas** — lista ou mini-gráfico de quem visitou o perfil | v2.29 | [ ] |
| R-DIS-01 | **Cinelar** — filtros por matilha e hashtag | v2.30 | [ ] |
| R-DIS-02 | **Cinelar** — seguir criador / feed de seguidos | v2.30 | [ ] |
| R-DIS-03 | **Amigos** — sugestões por `interests` do perfil | v2.30 | [ ] |

---

## P1 — Monetização (Pedigree)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-MON-03 | **PIX manual** — admin confirma pedido pendente na UI | v2.29 | [x] 2026-05-22 |
| R-MON-04 | **Dashboard** — lista pedidos premium (pendente/pago) | v2.29 | [x] 2026-05-22 |
| R-MON-05 | **Pet shop** — cupons com estoque e data de expiração na UI | v2.29 | [ ] |

---

## P1 — Federação 2.0 (Caramelo-Sync)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-FED-01 | **Sync agendado** — cron entre peers confiáveis | v2.30 | [ ] |
| R-FED-02 | **Conflitos** — política ao importar recado duplicado | v2.30 | [ ] |
| R-FED-03 | **Preview** — resumo do que será importado antes de aplicar | v2.30 | [ ] |
| R-FED-04 | **Opt-in** — sync só de matilhas marcadas públicas | v2.30 | [ ] |

---

## P2 — Mobile (Capacitor)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-MOB-01 | **Assets nativos** — ícones e splash Capacitor | v2.29 | [ ] |
| R-MOB-02 | **Deep links** — `/perfil`, `/latidos`, `/mensagens` | v2.29 | [ ] |
| R-MOB-03 | **Push nativo** — doc/bridge FCM (Android) e APNs (iOS) | v2.30 | [ ] |
| R-MOB-04 | **Permissões** — checklist mic/câmera testado no APK | v2.29 | [ ] |
| R-MOB-05 | **Offline** — SW cache mínimo do feed já lido | v2.30 | [ ] |

---

## P2 — UX e polish

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-UX-01 | **Onboarding** — wizard pós-cadastro (matilha, pet, PWA) | v2.29 | [ ] |
| R-UX-02 | **Acessibilidade** — ARIA, contraste, foco em formulários | v2.30 | [ ] |
| R-UX-03 | **Performance** — WebP/AVIF + lazy no Cinelar | v2.29 | [ ] |
| R-UX-04 | **i18n** — estrutura `next-intl` (pt-BR padrão) | v2.30 | [ ] |
| R-UX-05 | **Economia de dados** — modo só texto / sem autoplay vídeo | v2.30 | [ ] |

---

## P3 — Infra, segurança e ops

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-OPS-05 | **Backup** — script restore testado + doc em CONFIGURACAO | v2.29 | [x] 2026-05-22 |
| R-OPS-06 | **Alertas** — doc cron `curl` health na URL Tailscale | v2.29 | [x] 2026-05-22 |
| R-SEC-01 | **2FA** — TOTP ou passkeys no login | v2.30 | [ ] |
| R-SEC-02 | **Excluir conta** — LGPD purge DB + objetos S3 | v2.29 | [ ] |
| R-SEC-03 | **Rate limit** — por IP na tailnet (Redis) | v2.29 | [ ] |
| R-INF-04 | **Docker buildx** — doc/opcional no deploy (aviso buildx) | v2.28 | [ ] |
| R-INF-05 | **Turbopack** — voltar `next build` padrão quando estável | v2.31 | [ ] |

---

## P3 — Qualidade e testes

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-QA-01 | **Vitest** — API auth (login, sessão, logout) | v2.28 | [ ] |
| R-QA-02 | **Vitest** — posts + premium webhooks (401/503/400) | v2.28 | [ ] |
| R-QA-03 | **Playwright** — e2e login + feed autenticado | v2.29 | [ ] |
| R-QA-04 | **Vitest** — assinatura HMAC federação | v2.29 | [ ] |

---

## Histórico — onda v2.19–v2.27 (concluída)

<details>
<summary>Itens v2.19–v2.27 (referência)</summary>

Ver commits v2.19–v2.27 em `Versions.txt`. Roadmap P0–V3 original: **100% concluído**.

</details>

---

## Concluídos recentemente (referência)

| Versão | Entrega |
|--------|---------|
| v2.29.0 | Comunidades: mods, mural, ranking quente, busca; Pedigree admin |
| v2.28.0 | Fórum comunidades + checklist produção |
| v2.27.1 | Fix build Docker (webpack) |

---

*Última revisão: 2026-05-22 · versão de referência: v2.29.0-alpha.0 · **Onda v2.28+ em andamento***
