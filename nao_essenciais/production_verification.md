# Plano Estruturado de Verificação em Produção (Backend, Infraestrutura, Banco & Integrações)
**Projeto:** Brasil Caramelo Nostr  
**Versão Base:** v2.38.0-alpha.0  
**Data de Criação:** 03/09/2026  
**Papel:** Arquiteto de Software & Especialista em QA / Code Review

---

## 🎯 Objetivo e Diretrizes de Execução

Este documento estabelece um roteiro de auditoria e verificação metódica e exaustiva para **100% dos componentes de backend, infraestrutura, dados, scripts e integrações** do repositório.

### Regras Mandatórias de Execução
1. **Leitura Integral:** Ao executar o comando `"Execute a Fase X do production_verification.md"`, o agente deve ler arquivo por arquivo pertencente àquela fase, sem assumir contextos e sem pular trechos de código.
2. **Critério de Reporte:** Cada achado deve conter:
   - Caminho do arquivo e linha(s) exata(s).
   - Classificação: `[BUG]`, `[SEGURANÇA]`, `[PERFORMANCE]`, `[PONTA SOLTA / TODO]`, `[REFATORAÇÃO]`.
   - Evidência do código e impacto técnico/operacional.
   - Proposta de correção ou plano de ação imediato.
3. **Atualização de Status:** Ao finalizar a auditoria de cada fase, o status deve ser atualizado de `[ ] Pendente` para `[x] Concluído`, registrando a data e o resumo dos achados.

---

## 📊 Matriz de Status de Varredura

| Fase | Módulo / Escopo | Total de Arquivos | Status | Responsável / Data |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1** | Infraestrutura, Deploy, Docker & Reverse Proxy | 12 | [ ] Pendente | — |
| **Fase 2** | Banco de Dados, Schema & Migrações Prisma | 38 | [ ] Pendente | — |
| **Fase 3** | Autenticação, Sessões, Criptografia & Segurança | 22 | [ ] Pendente | — |
| **Fase 4** | Core Engine: Feed, Posts, Mídia & Algoritmos | 28 | [ ] Pendente | — |
| **Fase 5** | Protocolo Nostr, Relays & Sincronização Descentralizada | 18 | [ ] Pendente | — |
| **Fase 6** | Tempo Real, WebSockets (Soketi) & WebRTC (LiveKit/Coturn) | 16 | [ ] Pendente | — |
| **Fase 7** | Regras de Negócio: Pets, Adoção, Tribunal, Gamificação & PIX | 34 | [ ] Pendente | — |
| **Fase 8** | Scripts de Manutenção, Migração & Testes Automatizados | 37 | [ ] Pendente | — |

---

## 🔬 FASES DETALHADAS DE AUDITORIA

---

### 🔹 FASE 1: Infraestrutura, Deploy, Docker & Reverse Proxy

#### 📂 Arquivos Sob Auditoria:
* `Dockerfile`
* `docker-compose.yml`
* `deploy/caddy/Caddyfile`
* `deploy/nginx/brasilcaramelo.conf`
* `deploy/nginx/brasilcaramelo-https.example.conf`
* `deploy/nginx/brasilcaramelo-tunnel.conf`
* `deploy/livekit/livekit.yaml`
* `deploy/env/.env.production.example`
* `.env.example`
* `package.json`
* `next.config.ts`
* `tsconfig.json`

#### 📋 Checklist Específico da Fase:
- [ ] **Segurança & Credenciais:** Identificar portas desnecessariamente expostas ao host (`0.0.0.0`), segredos default em variáveis de ambiente, permissões de arquivos/volumes Docker e execução de containers como non-root.
- [ ] **Conexões & Redes:** Verificar configurações de healthcheck dos serviços dependentes (DB, Redis, Meilisearch, Soketi, LiveKit), isolamento da rede bridge `bc` e timeouts do Caddy/Nginx.
- [ ] **Performance & Recursos:** Checagem de limites de memória, overcommit do Redis, volume caching e otimizações de build multi-stage do Next.js.
- [ ] **Pontas Soltas:** Checar variáveis em `.env.example` sem correspondência no código ou com nomes depreciados.

---

### 🔹 FASE 2: Banco de Dados, Schema & Migrações Prisma

#### 📂 Arquivos Sob Auditoria:
* `prisma/schema.prisma`
* `prisma.config.ts`
* `src/lib/db.ts`
* `src/lib/prisma.ts`
* Todas as migrações em `prisma/migrations/*` (35 diretórios de migrations SQL)

#### 📋 Checklist Específico da Fase:
- [ ] **Integridade Relacional & Índices:** Verificar se todas as chaves estrangeiras (`Foreign Keys`) e campos usados em ordenações (`createdAt`, `reelScore`, `boostPriority`) e filtros frequentes possuem índices adequados (`@@index`).
- [ ] **Tratamento de Migrações:** Validar se há migrations com comandos perigosos (`DROP COLUMN`, `DROP TABLE`), ausência de `IF NOT EXISTS` ou inconsistências entre o `schema.prisma` e o banco em produção.
- [ ] **Connection Pooling & Concorrência:** Analisar instanciação do PrismaClient (prevenção de múltiplas instâncias em hot-reload), timeouts de conexão e configuração do driver adapter Pg/Prisma.
- [ ] **Pontas Soltas & Tipagem:** Campos marcados como opcionais (`?`) que não possuem tratamento defensivo no código ou tipos enums não mapeados.

---

### 🔹 FASE 3: Autenticação, Sessões, Criptografia & Segurança

#### 📂 Arquivos Sob Auditoria:
* `src/lib/auth.ts`
* `src/lib/auth-constants.ts`
* `src/lib/admin-auth.ts`
* `src/lib/security.ts`
* `src/lib/rate-limit.ts`
* `src/app/api/auth/login/route.ts`
* `src/app/api/auth/register/route.ts`
* `src/app/api/auth/logout/route.ts`
* `src/app/api/auth/session/route.ts`
* `src/app/api/auth/nostr-login/route.ts`
* `src/app/api/auth/reset-password/route.ts`
* `src/app/api/auth/verify/route.ts`
* Demais rotas em `src/app/api/auth/*`

#### 📋 Checklist Específico da Fase:
- [ ] **Vulnerabilidades de Auth:** Análise contra CSRF, fixation de sessão, expiração de JWT/Cookies HTTP-only, flags `SameSite` e `Secure`.
- [ ] **Nostr Cryptographic Auth (NIP-07 / NIP-98):** Validação estrita de assinaturas de eventos Nostr (verificação de assinatura com `schnorr`/`secp256k1`, timestamp drift de 60s, nonce/challenge para evitar replay attacks).
- [ ] **Proteção contra Brute Force & Abuso:** Eficácia do rate-limiting no Redis em rotas críticas (`/api/auth/*`, `/api/posts`, `/api/comments`).
- [ ] **Permissões & RBAC:** Validação das checagens de permissão de Administrador e Moderador no backend antes de mutações de dados.

---

### 🔹 FASE 4: Core Engine: Feed, Posts, Mídia & Algoritmos

#### 📂 Arquivos Sob Auditoria:
* `src/lib/feed-posts.ts`
* `src/lib/s3.ts`
* `src/lib/media.ts`
* `src/lib/video-transcode.ts`
* `src/lib/capsule.ts`
* `src/lib/recommendations.ts`
* `src/app/api/posts/route.ts`
* `src/app/api/posts/[id]/route.ts`
* `src/app/api/posts/[id]/like/route.ts`
* `src/app/api/posts/[id]/comment/route.ts`
* `src/app/api/posts/[id]/boost/route.ts`
* `src/app/api/feed/route.ts`
* `src/app/api/feed/personalized/route.ts`
* `src/app/api/reels/route.ts`
* `src/app/api/upload/route.ts`
* `src/app/api/upload/chunk/route.ts`
* Demais rotas em `src/app/api/posts/*` e `src/app/api/feed/*`

#### 📋 Checklist Específico da Fase:
- [ ] **Gargalos de Query (N+1):** Verificar se consultas de Feed e Posts usam `include` / `select` otimizados, evitando queries em loop para likes, comentários e pet badges.
- [ ] **Uploads & Sanitização de Mídia:** Validação de MIME types reais (magic bytes), limites de tamanho de payload, geração de thumbnails, transcodificação HLS e tratamento de falhas no MinIO/S3.
- [ ] **Cápsula do Tempo & Agendamento:** Validação rigorosa do filtro `capsuleReleaseAt` para evitar vazamento de posts antes da data de liberação.
- [ ] **Algoritmo de Reel & Boost:** Integridade do cálculo de `reelScore` e decaimento de prioridade de `boostedUntil`.

---

### 🔹 FASE 5: Protocolo Nostr, Relays & Sincronização Descentralizada

#### 📂 Arquivos Sob Auditoria:
* `src/lib/nostr/client.ts`
* `src/lib/nostr/relays.ts`
* `src/lib/nostr/events.ts`
* `src/lib/nostr/nip05.ts`
* `src/lib/nostr/nip19.ts`
* `src/lib/nostr/nip42.ts`
* `src/lib/nostr/nip57.ts`
* `src/lib/nostr/profile.ts`
* `src/app/api/nostr/publish/route.ts`
* `src/app/api/nostr/sync/route.ts`
* `src/app/api/.well-known/nostr.json/route.ts`
* Demais arquivos em `src/lib/nostr/*` e `src/app/api/nostr/*`

#### 📋 Checklist Específico da Fase:
- [ ] **Resiliência de Conexão com Relays:** Tratamento de timeouts, fallbacks para relays secundários, desconexões inesperadas de WebSockets e isolamento de erros sem quebrar a renderização do app.
- [ ] **Sincronização Bidirecional:** Validação de idempotência ao sincronizar eventos Nostr para o Postgres (evitar duplicação de posts e perfis pelo `nostrEventId`).
- [ ] **NIP-05 & Descoberta:** Validação do endpoint `/.well-known/nostr.json` para resolução correta de nomes de usuário e pubkeys.
- [ ] **Zaps & NIP-57 (Lightning):** Validação de invoices, recibos criptográficos e integridade de pagamentos via Lightning Network.

---

### 🔹 FASE 6: Tempo Real, WebSockets (Soketi) & WebRTC (LiveKit/Coturn)

#### 📂 Arquivos Sob Auditoria:
* `src/lib/pusher.ts`
* `src/lib/pusher-server.ts`
* `src/lib/livekit.ts`
* `src/lib/coturn.ts`
* `src/app/api/pusher/auth/route.ts`
* `src/app/api/chat/route.ts`
* `src/app/api/chat/[roomId]/route.ts`
* `src/app/api/chat/[roomId]/messages/route.ts`
* `src/app/api/live/route.ts`
* `src/app/api/live/token/route.ts`
* `src/app/api/live/[roomId]/end/route.ts`
* `src/app/api/notifications/route.ts`
* `src/app/api/notifications/read/route.ts`
* Demais arquivos de chat e live em `src/app/api/*`

#### 📋 Checklist Específico da Fase:
- [ ] **Autenticação em Canais Privados Pusher:** Validação se o endpoint `/api/pusher/auth` garante que apenas participantes autorizados possam se conectar a canais privados (`private-chat-*`, `presence-*`).
- [ ] **Geração de Tokens LiveKit:** Verificação de permissões de publicação/assinatura, expiração de tokens e limpeza de salas finalizadas.
- [ ] **Persistência de Mensagens:** Garantir que nenhuma mensagem enviada via WebSocket seja perdida em falhas momentâneas do banco.
- [ ] **STUN/TURN & NAT Traversal:** Checar configuração de credenciais efêmeras e roteamento TURN para conexões móveis (4G/5G).

---

### 🔹 FASE 7: Regras de Negócio: Pets, Adoção, Tribunal, Gamificação & PIX

#### 📂 Arquivos Sob Auditoria:
* `src/lib/gamification.ts`
* `src/lib/tribunal.ts`
* `src/lib/adoption.ts`
* `src/lib/pet-shop.ts`
* `src/lib/wallet.ts`
* `src/lib/pix.ts`
* `src/app/api/pets/*`
* `src/app/api/adoption/*`
* `src/app/api/tribunal/*`
* `src/app/api/gamification/*`
* `src/app/api/ranking/*`
* `src/app/api/wallet/*`
* `src/app/api/pix/*`
* `src/app/api/admin/*`

#### 📋 Checklist Específico da Fase:
- [ ] **Consistência do Tribunal Comunitário:** Validação de regras de quórum, peso de votos de jurados, expiração de prazos e execução automática de sanções (ocultação/unhide de posts).
- [ ] **Cálculo de XP & Gamificação:** Prevenção de exploits de ganho infinito de XP (ex: curtir/descurtir repetidamente), idempotência na concessão de badges e integridade do Ranking.
- [ ] **Fluxo de Adoção:** Validação de transição de estados dos pets (`AVAILABLE`, `PENDING`, `ADOPTED`) e permissões de edição pelo tutor/ONG.
- [ ] **Transações PIX & Carteira:** Validação de idempotência de transações, prevenção de saldo negativo e assinatura de webhooks de pagamento.

---

### 🔹 FASE 8: Scripts de Manutenção, Migração & Testes Automatizados

#### 📂 Arquivos Sob Auditoria:
* `nao_essenciais/scripts/*` (32 scripts de automação, diagnóstico e manutenção)
* `nao_essenciais/tests/unit/*`
* `nao_essenciais/tests/e2e/*`
* `vitest.config.ts`
* `playwright.config.ts`
* Scripts de build em `package.json`

#### 📋 Checklist Específico da Fase:
- [ ] **Segurança de Execução:** Identificar scripts com credenciais hardcoded, comandos destrutivos sem prompt de confirmação ou caminhos absolutos locais de desenvolvimento.
- [ ] **Cobertura de Testes:** Validar se os testes unitários e de integração cobrem cenários de erro, borda (edge cases) e falhas de rede.
- [ ] **Scripts Órfãos ou Obsoletos:** Catalogar e documentar scripts que não possuem mais utilidade no pipeline atual.

---

## 📝 Protocolo de Reporte e Registro

Ao auditar cada fase, os resultados devem ser documentados com o seguinte padrão:

```markdown
### 📌 Relatório de Auditoria: [Fase X] - [Nome da Fase]
- **Data:** DD/MM/AAAA
- **Arquivos Analisados:** X/X arquivos
- **Status:** [x] Concluído

#### 🔴 Achados Críticos (Bugs & Segurança)
* `caminho/do/arquivo.ts:L123` - [TIPO]: Descrição detalhada do impacto e proposta de correção.

#### 🟡 Achados Moderados (Performance & N+1)
* `caminho/do/arquivo.ts:L45` - [TIPO]: Detalhamento do gargalo e otimização recomendada.

#### 🔵 Melhorias & Refatoração (Pontas Soltas & Limpeza)
* `caminho/do/arquivo.ts:L88` - [TIPO]: TODO pendente ou refatoração sugerida.
```
