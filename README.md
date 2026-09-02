# 🐕 Brasil Caramelo (Nostr) — Rede Social Brasileira Soberana

[![Versão](https://img.shields.io/badge/versão-2.37.0--alpha.0-amber.svg)](Versions.txt)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![Nostr](https://img.shields.io/badge/Nostr-NIP--01%20%7C%20NIP--44%20%7C%20NIP--57-purple.svg)](https://github.com/nostr-protocol/nips)
[![Testes](https://img.shields.io/badge/testes-27%2F27%20aprovados-success.svg)](relatorios/RELATORIO_TESTES_E2E_APLICATIVO_COMPLETO.html)

Rede social brasileira **híbrida e 100% self-hosted**, combinando a nostalgia aconchegante dos anos 2000 (estilo Orkut, comunidades e depoimentos) com a **liberdade, privacidade e soberania digital descentralizada do protocolo Nostr (Web3) e pagamentos instantâneos via Lightning Network (Bitcoin)**.

---

## 🎯 1. Objetivo do Aplicativo

* **Soberania e Liberdade de Expressão:** Permitir que criadores e usuários publiquem recados de forma descentralizada e incensurável através de relays Nostr mundiais, sem depender de monopólios de Big Techs.
* **Experiência Híbrida Inteligente:**
  * **Modo Rede Social (Web2):** Cadastro simples por e-mail/senha, banco relacional PostgreSQL de alto desempenho, compatibilidade com LGPD (direito ao esquecimento e exportação de dados).
  * **Modo Livre (Nostr / Web3):** Login criptográfico via chaves `npub`/`nsec` ou extensões NIP-07 (Alby, Nos2x, Amber), mensagens diretas de ponta a ponta NIP-44 e Zaps Lightning em 1-clique.
* **Gamificação & Identidade Cultural:** Pet Virtual Caramelo dinâmico com cuidados diários, economia de CarameloCoins, moderação coletiva no *Tribunal do Cão*, *Casinhas* comunitárias e salas de áudio *Latidos ao Vivo*.

---

## 🏗️ 2. Infraestrutura & Arquitetura

O sistema opera de forma autônoma e conteinerizada via **Docker Compose**:

| Serviço | Imagem / Tecnologia | Porta | Finalidade Operacional |
|:---|:---|:---:|:---|
| **App Web** | `Next.js 16 (App Router)` | `3000` | Interface de usuário (SSR/PWA) e rotas de API Serverless |
| **Banco Relacional** | `PostgreSQL 16` | `5432` | Persistência relacional gerenciada via Prisma ORM |
| **Proxy Reverso / SSL**| `Caddy Server` | `80 / 443` | Terminação SSL/TLS automática (Let's Encrypt) e roteamento HTTP/2 |
| **Mensageria Realtime**| `Soketi (Pusher Protocol)`| `6001` | Notificações instantâneas, digitação e chats via WebSockets |
| **Áudio / Vídeo SFU** | `LiveKit Server` | `7880` | Salas de áudio ao vivo (*Latidos ao Vivo*) com chaveamento SFU |
| **Motor de Busca** | `Meilisearch` | `7700` | Busca instantânea full-text de posts, hashtags e amigos |
| **Armazenamento S3** | `MinIO Object Storage` | `9000` | Armazenamento de fotos, vídeos e áudios de depoimentos |
| **Cache & Limiter** | `Redis / In-Memory TTL`| `6379` | Cache de agregação de trending, ranking e rate limiting |

---

## ⚡ 3. Stack Tecnológica

* **Frontend:**
  * Framework: `Next.js 16.2.6` (App Router + Turbopack / Webpack)
  * Biblioteca UI: `React 19.0.0` + `TypeScript 5.x`
  * Estilização: `Vanilla CSS Tokens` + `Tailwind CSS 4.x` (Tema Claro / Escuro OLED / Automático)
  * Efeitos Sonoros: `Web Audio API` sintetizada nativa (latidos, moedas e tribunal)
  * Mobile & Offline: `Progressive Web App (PWA)` com Service Worker *Stale-While-Revalidate*
* **Backend & APIs:**
  * Rotas: `Next.js Server Actions` e `111 rotas de API`
  * ORM: `Prisma Client 7.8.0` com índices compostos de alta performance
  * Autenticação: `Bcrypt.js` + Sessões criptográficas com revogação instantânea
* **Web3, Criptografia & Lightning:**
  * Protocolo Nostr: `nostr-tools 2.7.2`
  * Criptografia Simétrica & DMs: `ChaCha20-Poly1305` + `HKDF` (NIP-44 v2) e `WebCrypto AES-GCM (256-bit)`
  * Pagamentos: `WebLN` (Zaps 1-clique), `LNURL-withdraw`, gateways `Mercado Pago (Pix)` e `LNbits/LND`

---

## 📜 4. NIPs do NOSTR Implementadas

O Brasil Caramelo implementa e mantém conformidade com as principais especificações oficiais do protocolo Nostr:

| NIP | Título da Especificação | Como está implementado no Brasil Caramelo |
|:---|:---|:---|
| **NIP-01** | *Basic Protocol Flow* | Criação de identidade, assinatura Schnorr, eventos Kind 0 (perfil), Kind 1 (recados) e Kind 7 (reações). |
| **NIP-04** | *Encrypted Direct Messages* | Criptografia legada (AES-256-CBC) mantida para compatibilidade com clientes antigos. |
| **NIP-05** | *DNS-based Verification* | Endpoint público `/.well-known/nostr.json` para verificação de chaves e identificação `@brasilcaramelo.com`. |
| **NIP-07** | *Browser Extensions* | Login e assinatura sem exposição de chave privada via extensões (`window.nostr` - Alby, Nos2x, Amber). |
| **NIP-09** | *Event Deletion Requests* | Emissão de pedidos de exclusão de eventos transmitidos para relays públicos. |
| **NIP-19** | *bech32-encoded Entities* | Conversão e parsing de chaves e eventos nos formatos `npub1`, `nsec1`, `note1` e `nprofile1`. |
| **NIP-25** | *Reactions* | Envio e sincronização de reações (corações, biscoitos e emojis) em notas públicas. |
| **NIP-44** | *Encrypted Payloads (Versioned)* | **Criptografia moderna (v2)** de ponta a ponta para chats privados usando ChaCha20-Poly1305 + HKDF. |
| **NIP-47** | *Nostr Wallet Connect (NWC)* | Conexão com carteiras Lightning externas e saque de moedas ganhas na plataforma. |
| **NIP-57** | *Lightning Zaps* | Envio e recebimento de micro-pagamentos (Satoshis) em posts com comprovante de recibo Kind 9735. |

---

## 📁 5. Estrutura de Pastas (Guia Rápido)

```text
brasil_caramelo/
├── prisma/                      # Definições do banco de dados relacional
│   └── schema.prisma            # Modelos de dados, enums e índices compostos
├── public/                      # Assets estáticos, ícones e Service Worker
│   └── sw.js                    # PWA Service Worker (Cache Stale-While-Revalidate)
├── relatorios/                  # Central unificada de relatórios e auditorias
│   ├── RELATORIO_TESTES_E2E_APLICATIVO_COMPLETO.html  # Testes E2E (Login ao Logout)
│   ├── RELATORIO_TESTES_AUTOMATIZADOS_FUNCIONALIDADES.html # Testes funcionais
│   ├── RELATORIO_AVALIACAO_FRONTEND.html             # Avaliação visual e métricas
│   ├── RELATORIO_ANALISE_FRONTEND_BRASIL_CARAMELO.pdf # Auditoria do Frontend
│   └── RELATORIO_ANALISE_GERAL_BRASIL_CARAMELO.pdf    # Auditoria Técnica Geral
├── src/
│   ├── app/                     # Next.js 16 App Router (36 páginas e 111 APIs)
│   │   ├── (app)/               # Rotas autenticadas (feed, perfil, cachorro, casinhas, tribunal)
│   │   ├── api/                 # Endpoints REST (auth, posts, pet, premium, nostr, tribunal)
│   │   └── globals.css          # Design System e variáveis de tema (Claro/Escuro OLED)
│   ├── components/              # 191 Componentes React modulares
│   │   ├── nostr/               # Componentes Web3 (Zaps, Relays, Perfis Nostr)
│   │   ├── BottomNav.tsx        # Barra de navegação móvel com Mini-Widget do Pet
│   │   ├── StoriesOrkutBar.tsx  # Stories retrô da matilha
│   │   ├── ThemeToggle.tsx      # Alternador de tema Tri-State (Auto/Claro/Escuro)
│   │   └── SoundToggle.tsx      # Controle de efeitos sonoros retrô
│   └── lib/                     # Regras de negócio e utilitários
│       ├── nostr/               # Handlers de eventos, chaves e criptografia NIP-44
│       ├── sound-fx.ts          # Síntese Web Audio API
│       ├── rate-limit.ts        # Sliding Window Rate Limiter
│       ├── cache.ts             # TTL In-Memory Cache
│       └── theme.ts             # Gerenciador de temas
├── tests/                       # Suíte de testes automatizados (27 testes)
│   ├── e2e_full_lifecycle.test.mjs  # Ciclo completo de vida (Login ao Logout)
│   └── automated_full_suite.test.mjs # Testes funcionais por módulo
├── deploy-hostinger.sh          # Script de provisionamento e deploy automático em 1 comando
├── ROADMAP.md                   # Fonte única e cronograma de tarefas do roadmap
└── Versions.txt                 # Histórico formal de versões e changelog
```

---

## 🛠️ 6. Dores & Sintomas Mitigados

| Sintoma / Dor Comum | Como foi Solucionado na Arquitetura |
|:---|:---|
| **Engasgos no Scroll do Feed** | Otimização de renderização com prevenção de CLS, virtualização de lista e lazy loading de imagens. |
| **Lentidão em Consultas de Banco** | Criação de **índices compostos** (`Post`, `Friendship`, `Reputation`, `nostrEventId`) garantindo consultas sub-30ms. |
| **Ataques de Força Bruta / Spam** | Implementação de **Sliding Window Rate Limiter** protegendo rotas críticas (`/api/auth/login`, `/api/upload`, `/api/posts`). |
| **Queda de Conexão WebSocket** | Reconexão de relays Nostr com **Exponential Backoff + Jitter** e deduplicação de eventos em cache. |
| **Vazamento de Chaves Privadas** | Chaves `nsec` protegidas no navegador via **WebCrypto AES-GCM (256-bit)** com senha mestra do usuário. |

---

## 🚀 7. Como Executar o Projeto

### Ambiente de Desenvolvimento Local (Windows / Mac / Linux)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Gerar cliente e migrar banco de dados
npx prisma generate
npx prisma migrate dev

# 4. Executar suíte de testes
npm test # ou node --test tests/automated_full_suite.test.mjs

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse no navegador: **`http://localhost:3000`**

### Deploy Automatizado em Produção (VPS Hostinger / Ubuntu)

Em sua VPS Ubuntu limpa, execute o script de 1 comando:

```bash
bash deploy-hostinger.sh
```

O script configura firewall (UFW), instala Docker, gera certificados SSL automáticos via Caddy e sobe todos os 8 containers de alta disponibilidade.

---

## 📊 8. Central de Relatórios do Projeto

Para consultar os diagnósticos e relatórios completos, abra os arquivos no diretório [`relatorios/`](./relatorios/):

* 🚀 **[Relatório E2E Ciclo Completo (HTML)](./relatorios/RELATORIO_TESTES_E2E_APLICATIVO_COMPLETO.html)** — Simulação completa do cadastro ao logout (100% de sucesso).
* 🧪 **[Relatório de Testes Automatizados (HTML)](./relatorios/RELATORIO_TESTES_AUTOMATIZADOS_FUNCIONALIDADES.html)** — Diagnóstico funcional por módulo.
* 🌐 **[Painel de Avaliação do Frontend (HTML)](./relatorios/RELATORIO_AVALIACAO_FRONTEND.html)** — Métricas e componentes da interface.
* 🎨 **[Auditoria de Frontend (PDF)](./relatorios/RELATORIO_ANALISE_FRONTEND_BRASIL_CARAMELO.pdf)** — Análise visual e acessibilidade diagramada.
* 📄 **[Auditoria Geral de Arquitetura (PDF)](./relatorios/RELATORIO_ANALISE_GERAL_BRASIL_CARAMELO.pdf)** — Diagnóstico técnico completo do sistema.
