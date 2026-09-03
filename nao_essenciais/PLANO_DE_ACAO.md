# 📋 Plano de Ação & Implementação — Brasil Caramelo (Nostr)
**Versão Planejada:** `v2.38.0`  
**Data:** 02 de Setembro de 2026  
**Status:** Decisões do Usuário Incorporadas & Pronto para Execução  

---

## 🎯 Decisões Estratégicas Alinhadas com o Usuário

1. **Automação SSH via `.env`:** Adicionar variáveis `SSH_HOST`, `SSH_PORT`, `SSH_USER` e `SSH_PASSWORD` no `.env` para que os scripts de teste e deploy executem sem solicitar credenciais no terminal.
2. **Relé Nostr & Upload de Mídia/Imagens (NIP-96 + Blossom + MinIO):**
   - Para envio de eventos e notas: Utilizar relé de desenvolvimento integrado ou relé local.
   - Para upload de fotos, áudios e vídeos no padrão Nostr: Implementar os endpoints oficiais **NIP-96** e **Blossom Server** integrados ao nosso container **MinIO / S3** local. Qualquer cliente Nostr (Damus, Amethyst, Snort) poderá fazer upload diretamente na nossa infraestrutura soberana.
3. **Cadastro 100% Anônimo:** Usuários poderão criar conta instantaneamente apenas com sua chave pública Nostr (`npub` via NIP-07 / Alby), sem obrigatoriedade de informar e-mail ou senha.
4. **Monetização de Zaps em Carteira Interna:** Os Satoshis recebidos via Zaps acumulam no saldo de CarameloCoins da plataforma e ficam disponíveis para saque a qualquer momento para carteiras Lightning pessoais via fatura bolt11.

---

## 🔴 Fase 1: Prioridade CRÍTICA (Segurança, SSH no .env & Cadastro Anônimo)

> **Objetivo:** Blindar a plataforma, automatizar testes remotos via `.env` e viabilizar acesso anônimo soberano via Nostr.

- [ ] **1.1. Suporte a Credenciais SSH no `.env` para Diagnósticos Automáticos**
  - *Descrição:* Criar utilitário `scripts/remote_ssh.py` que lê `SSH_HOST`, `SSH_USER`, `SSH_PASSWORD` do `.env` local e executa comandos/testes diretamente no servidor Ubuntu `192.168.1.6`.
  - *Arquivos:* `.env.example`, `scripts/remote_ssh.py`.

- [ ] **1.2. Cadastro e Login 100% Anônimo via Nostr (NIP-07)**
  - *Descrição:* Permitir que o usuário clique em "Entrar com Nostr" e acesse o app instantaneamente sem e-mail ou senha, gerando sessão autenticada vinculada à sua chave pública `npub`.
  - *Arquivos:* `src/app/api/auth/nostr-login/route.ts`, `src/components/NostrExtensionLogin.tsx`, `src/app/(auth)/login/page.tsx`.

- [ ] **1.3. Sanitização Rigorosa de Links Nostr (NIP-01)**
  - *Descrição:* Parser defensivo para neutralizar esquemas perigosos (`javascript:`, `data:`) em notas vindas de relays públicos.
  - *Arquivos:* `src/lib/nostr/content-parser.ts`, `src/components/nostr/NostrEventCard.tsx`.

- [ ] **1.4. Resiliência de WebSockets com Exponential Backoff + Jitter**
  - *Descrição:* Reconexão suave de relays Nostr e canais Soketi em redes móveis instáveis.
  - *Arquivos:* `src/lib/nostr/relays.ts`, `src/lib/realtime.ts`.

---

## 🟡 Fase 2: Prioridade IMPORTANTE (Upload de Mídia NIP-96/Blossom & Performance)

> **Objetivo:** Upload descentralizado de fotos/vídeos no padrão Nostr e carregamento sub-50ms no feed.

- [ ] **2.1. Servidor de Mídia Nostr NIP-96 & Blossom integrado ao MinIO**
  - *Descrição:* Implementar endpoints `/api/nostr/nip96` e `/api/blossom/upload` que recebem uploads autenticados por assinatura Nostr (Kind 24242 / Auth Header), gravam no MinIO S3 local e retornam URLs públicas hash SHA-256.
  - *Arquivos:* `src/app/api/nostr/nip96/route.ts`, `src/app/api/blossom/upload/route.ts`, `src/lib/s3.ts`.

- [ ] **2.2. Cache Local de Eventos Nostr em IndexedDB**
  - *Descrição:* Persistência de notas, perfis e feeds Nostr em IndexedDB local no navegador, reduzindo 80% do tráfego aos relays.
  - *Arquivos:* `src/lib/nostr/storage-cache.ts`, `src/lib/nostr/events.ts`.

- [ ] **2.3. Virtualização de Listas no Feed Principal**
  - *Descrição:* Rolagem fluida a 60 FPS com `@tanstack/react-virtual` no `FeedInfinite.tsx`.
  - *Arquivos:* `src/components/FeedInfinite.tsx`, `src/components/PostCard.tsx`.

- [ ] **2.4. Sessão de Áudio Persistente em Background para "Latidos ao Vivo"**
  - *Descrição:* Player WebRTC flutuante no layout global para navegar pelo feed sem interromper o áudio.
  - *Arquivos:* `src/components/LiveVoiceRoom.tsx`, `src/components/GlobalAudioFloatingBar.tsx`.

---

## 🟢 Fase 3: Prioridade DESEJÁVEL (Zaps em Moedas, Scrapbook & Relé Local)

> **Objetivo:** Monetização de criadores, nostalgia interativa e infraestrutura soberana de relé.

- [ ] **3.1. Acúmulo de Zaps em CarameloCoins & Saque Lightning**
  - *Descrição:* Converter Zaps recebidos (sats) em saldo da carteira da plataforma com botão de saque instantâneo para carteiras externas via fatura bolt11.
  - *Arquivos:* `src/app/api/nostr/zap-receiver/route.ts`, `src/app/api/pet/withdraw/route.ts`, `src/components/WalletCoinsCard.tsx`.

- [ ] **3.2. Scrapbook com Threads em Depoimentos**
  - *Descrição:* Respostas encadeadas aos depoimentos deixados no perfil no clássico formato Orkut 2004.
  - *Arquivos:* `src/components/ScrapbookThreadView.tsx`, `src/app/api/testimonials/reply/route.ts`.

- [ ] **3.3. Recado Fixado no Perfil**
  - *Descrição:* Recado favorito fixado no topo do perfil com moldura dourada.
  - *Arquivos:* `src/components/ProfileHeader.tsx`, `src/app/api/profile/pin-post/route.ts`.

- [ ] **3.4. Relé Nostr Local no Docker Compose (Khatru / Nosflare)**
  - *Descrição:* Adicionar serviço de relé local no `docker-compose.yml` para comunicação interna ultrarrápida (sub-10ms).
  - *Arquivos:* `docker-compose.yml`, `Caddyfile`.

---

## 📊 Matriz de Execução

| Fase | Prazo Estimado | Foco Principal | Entregáveis Chave |
|:---:|:---:|:---|:---|
| **Fase 1 (Crítico)** | Imediato | Segurança, SSH `.env` & Cadastro Anônimo | SSH automatizado, login Nostr 1-clique, sanitização |
| **Fase 2 (Importante)**| Curto Prazo | Upload NIP-96/MinIO & Performance | Upload de fotos Nostr, cache IndexedDB, virtualização |
| **Fase 3 (Desejável)** | Médio Prazo | Zaps na Carteira, Scrapbook & Relé | Zaps -> Moedas, depoimentos em thread, relé Docker |
