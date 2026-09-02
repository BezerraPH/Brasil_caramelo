# 📋 Plano de Ação & Implementação — Brasil Caramelo (Nostr)
**Versão Planejada:** `v2.38.0`  
**Data:** 02 de Setembro de 2026  
**Status:** Aguardando Aprovação do Usuário  

---

## 🎯 Visão Geral do Plano

Este plano organiza as entregas para a evolução da rede social **Brasil Caramelo**, priorizando estabilidade, alta performance no feed, segurança na camada Web3/Nostr e novos recursos nostálgicos e descentralizados.

---

## 🔴 Fase 1: Prioridade CRÍTICA (Segurança, Conexões & Resiliência)

> **Objetivo:** Blindar a plataforma contra falhas de conexão, mitigar riscos de segurança e garantir estabilidade operacional.

- [ ] **1.1. Sanitização Rigorosa de Links Nostr (NIP-01)**
  - *Descrição:* Adicionar parser defensivo para bloquear esquemas maliciosos (`javascript:`, `data:`) em notas externas recebidas de relays públicos, permitindo apenas `https://` e `nostr:`.
  - *Arquivos:* `src/lib/nostr/content-parser.ts`, `src/components/nostr/NostrEventCard.tsx`.
  - *Critério de Aceite:* 100% dos links externos abrem com `rel="noopener noreferrer"` e URLs perigosas são neutralizadas.

- [ ] **1.2. Resiliência de WebSockets com Exponential Backoff + Jitter**
  - *Descrição:* Implementar reconexão inteligente no `SimplePool` para relays Nostr e canais `Soketi`, prevenindo picos de reconexão simultânea em redes móveis instáveis.
  - *Arquivos:* `src/lib/nostr/relays.ts`, `src/lib/realtime.ts`.
  - *Critério de Aceite:* Quedas temporárias de rede reconectam suavemente sem travar a interface do usuário.

- [ ] **1.3. Ajuste de Chave Pública SSH no Servidor (192.168.1.6)**
  - *Descrição:* Orientar/configurar a autorização da chave SSH local em `~/.ssh/authorized_keys` no servidor Ubuntu para viabilizar deploys remotos contínuos sem rejeição de senha.
  - *Arquivos:* `scripts/deploy-brasil-caramelo.sh`, `scripts/setup-ssh-key.sh`.

---

## 🟡 Fase 2: Prioridade IMPORTANTE (Performance & UX Mobile-First)

> **Objetivo:** Garantir tempo de carregamento sub-50ms e uso eficiente de memória RAM em smartphones.

- [ ] **2.1. Cache Local de Eventos Nostr em IndexedDB**
  - *Descrição:* Persistir notas, perfis e feeds Nostr em cache local IndexedDB no navegador do usuário, evitando requisições repetidas aos relays externos.
  - *Arquivos:* `src/lib/nostr/storage-cache.ts`, `src/lib/nostr/events.ts`.
  - *Critério de Aceite:* Renderização instantânea de notas já baixadas mesmo em modo offline/queda de sinal.

- [ ] **2.2. Virtualização de Listas no Feed Principal**
  - *Descrição:* Integrar `@tanstack/react-virtual` no `FeedInfinite.tsx` para renderizar apenas os elementos visíveis na janela de visualização do usuário.
  - *Arquivos:* `src/components/FeedInfinite.tsx`, `src/components/PostCard.tsx`.
  - *Critério de Aceite:* Rolagem contínua fluida a 60 FPS com centenas de postagens no feed mobile.

- [ ] **2.3. Sessão de Áudio Persistente em Background para "Latidos ao Vivo"**
  - *Descrição:* Mover o player WebRTC/LiveKit para o layout global (`src/app/layout.tsx`), permitindo que os participantes continuem ouvindo e falando enquanto navegam por outras páginas e casinhas.
  - *Arquivos:* `src/components/LiveVoiceRoom.tsx`, `src/components/GlobalAudioFloatingBar.tsx`.
  - *Critério de Aceite:* Mudança de rota não desconecta nem interrompe a transmissão de áudio.

---

## 🟢 Fase 3: Prioridade DESEJÁVEL (Novas Funcionalidades Nostr & Retrô)

> **Objetivo:** Aumentar retenção, engajamento e aprofundar a integração com o ecossistema Nostr mundial.

- [ ] **3.1. Scrapbook com Threads em Depoimentos**
  - *Descrição:* Permitir que amigos respondam diretamente aos depoimentos recebidos no perfil, criando uma conversa encadeada no clássico estilo Orkut 2004.
  - *Arquivos:* `src/components/ScrapbookThreadView.tsx`, `src/app/api/testimonials/reply/route.ts`.
  - *Critério de Aceite:* Interface retrô com botão "Responder Depoimento" e histórico encadeado.

- [ ] **3.2. Recado Fixado no Perfil do Usuário**
  - *Descrição:* Permitir que o dono do perfil escolha um recado ou frase de status para fixar no topo com moldura dourada caramelo.
  - *Arquivos:* `src/components/ProfileHeader.tsx`, `src/app/api/profile/pin-post/route.ts`.
  - *Critério de Aceite:* Recado fixado visível imediatamente no topo do perfil para todos os visitantes.

- [ ] **3.3. Descoberta Automática de Relays (NIP-65 Relay List Metadata)**
  - *Descrição:* Sincronizar e publicar automaticamente a lista de relays favoritos do usuário na rede Nostr para máxima interoperabilidade com outros clientes (Damus, Amethyst, Snort, Coracle).
  - *Arquivos:* `src/lib/nostr/nip65.ts`, `src/components/nostr/RelayManager.tsx`.
  - *Critério de Aceite:* Perfis leem e salvam eventos Kind 10002 de lista de relays.

- [ ] **3.4. Container de Relé Nostr Nativo no Docker Compose (Opcional)**
  - *Descrição:* Adicionar um relé local ultrarrápido (`khatru` ou `strfry`) ao cluster Docker do servidor para oferecer latência sub-10ms em `wss://relay.brasilcaramelo.com`.
  - *Arquivos:* `docker-compose.yml`, `Caddyfile`.

---

## 📊 Matriz de Esforço vs. Impacto

```
      ALTO IMPACTO
           ▲
           │   [2.1] Cache IndexedDB      [1.1] Sanitização Links
           │   [2.2] Virtualização Feed   [1.2] Backoff WebSockets
           │   [3.1] Scrapbook Threads    [2.3] Áudio Background
           │
           │   [3.2] Recado Fixado        [3.4] Relé Docker Local
           │   [3.3] NIP-65 Discovery     [1.3] Chave SSH Servidor
           │
           └─────────────────────────────────────────────────────►
           BAIXO ESFORÇO                           ALTO ESFORÇO
```

---

> **Aviso:** O código da aplicação não foi modificado nesta etapa de diagnóstico, conforme instrução. Aguardando sua validação sobre as prioridades e dúvidas para iniciarmos a implementação da versão `v2.38.0`.
