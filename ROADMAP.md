# Brasil Caramelo — Roadmap (checklist)

**Fonte única de tarefas planejadas.** Marque `[x]` ao concluir cada item.

## Regra para humanos e IA (não pular)

Ao **começar** um item: opcionalmente anote `→ em progresso` na linha.  
Ao **concluir**:

1. Troque `[ ]` por `[x]` neste arquivo (adicione data `YYYY-MM-DD` e ID da versão).
2. Atualize **`Versions.txt`**: instruções no topo, seção **ROADMAP (resumo)**, **FUNCIONALIDADES ATUAIS** e **HISTÓRICO DE VERSÕES**.
3. Se for entrega de produto: incremente **`package.json`**.
4. Se o item aparecer na UI: atualize **`src/components/RoadmapPanel.tsx`**.

Legenda: **P0** crítico · **P1** alto valor · **P2** polish · **P3** infra · **V3** pós-MVP

---

## Resumo rápido

| Prioridade | Total | Concluídos |
|------------|------:|-----------:|
| P0         | 4     | 4          |
| P1         | 15    | 15         |
| P2         | 8     | 8          |
| P3         | 6     | 6          |
| V3         | 4     | **4**      |

**Roadmap priorizado (P0–V3): concluído.** Evoluções futuras vão para issues/backlog fora deste arquivo.

---

## P0 — Próximo sprint (produto)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-019-01 | **Cinelar FYP** | v2.19 | [x] 2026-05-22 |
| R-019-02 | **Triângulo modos** — enquete no feed Matilha | v2.19 | [x] 2026-05-22 |
| R-019-03 | **Triângulo modos** — mini-grid fotos Orkut | v2.19 | [x] 2026-05-22 |
| R-019-04 | **Triângulo modos** — graus na Fila do Pão de Queijo | v2.19 | [x] 2026-05-22 |

---

## P1 — Produto e monetização

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-UI-01 | **Visual Brasil Moderno** | v2.20 | [x] 2026-05-22 |
| R-MON-01 | **Pedigree Pix real** | v2.21 | [x] 2026-05-22 |
| R-MON-02 | **Pet shops parceiros** | v2.22 | [x] 2026-05-22 |
| R-ENG-01..07 | Notificações, Matilhas quentes, Dono do Topo, etc. | v2.20 | [x] 2026-05-22 |
| R-UI-02 | **RoadmapPanel** | v2.19 | [x] 2026-05-22 |
| R-INF-01 | **Busca Meilisearch** | v2.23 | [x] 2026-05-22 |
| R-LIVE-01..03 | Latidos, LiveKit×Matilha, WebRTC debug | v2.21–22 | [x] 2026-05-22 |

---

## P2 — PWA e polish

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-PWA-01..02 | PWA install + push tailnet | v2.21–23 | [x] 2026-05-22 |
| R-UI-03..06 | Landing, explorar, sorte, reputação | v2.20 | [x] 2026-05-22 |
| R-DOC-01..02 | CONFIGURACAO + fix nginx Tailscale | v2.18 | [x] 2026-05-22 |

---

## P3 — Infra, qualidade e ops

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-OPS-01..04 | CI, Redis, observabilidade, backup | v2.24 | [x] 2026-05-22 |
| R-INF-02 | **MinIO** | v2.25 | [x] 2026-05-22 |
| R-INF-03 | HTTPS LAN doc | — | [x] 2026-05-22 |

---

## V3 — Pós-MVP (backlog priorizado)

| ID | Item | Alvo | Status |
|----|------|------|--------|
| R-V3-01 | **Comunidades** estilo Orkut clássico | v2.26 | [x] 2026-05-22 |
| R-V3-02 | **Export GDPR** — dump JSON | v2.26 | [x] 2026-05-22 |
| R-V3-03 | **Federação** Caramelo-Sync Tailscale (não só LAN) | v2.27 | [x] 2026-05-22 |
| R-V3-04 | **App nativo** (Capacitor) reutilizando PWA | v2.27 | [x] 2026-05-22 |

---

## Concluídos recentemente (referência)

| Versão | Entrega |
|--------|---------|
| v2.27 | Federação Tailscale + probe + Capacitor |
| v2.26 | Comunidades Orkut + exportação LGPD JSON |
| v2.25 | MinIO/S3 mídia |
| v2.24 | Redis, CI, ops, backup |

---

*Última revisão: 2026-05-22 · versão de referência: v2.27.1-alpha.0 · **Roadmap fechado para deploy***
