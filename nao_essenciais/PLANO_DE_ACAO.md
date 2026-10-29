# 📋 Plano de Ação & Implementação — Brasil Caramelo (Roadmap & Evolução Contínua)
**Versão Atual Implementada:** `v2.40.0-alpha.0`  
**Data:** 29 de Outubro de 2026  
**Status:** Fase v2.40 Concluída & Próximas Ondas (v2.41 / v2.42) Mapeadas  

---

## 🎯 Decisões Estratégicas & Arquiteturais Consolidadas

1. **Blindagem React 19 / Next.js 16 (Concluída em v2.40):**
   - Eliminação de `set-state-in-effect` síncrono.
   - Adoção de inicialização preguiçosa `useState(() => ...)` e efeitos desacoplados assíncronos.
   - TypeScript estrito sem `any` soltos.

2. **Scrapbook e Recado do Dia com Zero Migration Lock (Concluída em v2.40):**
   - Suporte a threads e respostas aninhadas nos depoimentos (`R-SOC-01`) usando serialização estruturada e retrocompatível no campo `content`.
   - Recado do dia fixado no perfil (`R-SOC-03`) utilizando `boostPriority: 999` com badge dourado e moldura nostálgica Orkut 2004.

3. **Cinelar com Filtros de Descoberta Rápida (Concluída em v2.40):**
   - Feed vertical (`R-DIS-01`) enriquecido com chips dinâmicos horizontais por hashtags (`#caramelo`, `#resgate`, `#adote`, `#humor`, `#filhotes`, `#matilha`).

4. **Nostr Media Sovereign — NIP-96 & Blossom Server (Concluída em v2.40):**
   - Endpoints soberanos `/.well-known/nostr/nip96.json`, `/api/nostr/nip96` e `/api/blossom/upload` (`R-NOS-11`).
   - Armazenamento com hash SHA-256 e integração ao storage MinIO/S3.

---

## 🔴 Marco Concluído: `v2.40.0-alpha.0` (2026-10-29)

- [x] **0.1. Blindagem de Linter React 19 / Next.js 16**
  - *Arquivos:* `SettingsTabbedView.tsx`, `SoundToggle.tsx`, `ThemeToggle.tsx`, `UserDropdownMenu.tsx`, `NostrRelayStatus.tsx`, `nostr-login/route.ts`, `NostrExtensionLogin.tsx`.
  - *Resultado:* `npm run lint` 100% verde (0 erros, 0 avisos).
- [x] **1.1. R-SOC-01 Scrapbook / Depoimentos em Threads**
  - *Arquivos:* `src/lib/testimonials-thread.ts`, `src/app/api/testimonials/[id]/reply/route.ts`, `src/components/TestimonialThreadView.tsx`, `TestimonialsSection.tsx`, `TestimonialsInbox.tsx`.
- [x] **1.2. R-SOC-03 Recado do Dia / Scrap Fixado no Topo do Perfil**
  - *Arquivos:* `src/app/api/profile/pinned-scrap/route.ts`, `src/components/ProfilePinnedScrap.tsx`, `src/app/(app)/perfil/[username]/page.tsx`.
- [x] **1.3. R-DIS-01 Cinelar: Filtros Dinâmicos Horizontais por Hashtag**
  - *Arquivos:* `src/lib/cinelar-fyp.ts`, `src/app/api/posts/cinelar/route.ts`, `src/components/CinelarFeed.tsx`.
- [x] **1.4. R-NOS-11 Servidor de Mídia Nostr NIP-96 & Blossom HTTP Blob Server**
  - *Arquivos:* `src/app/.well-known/nostr/nip96.json/route.ts`, `src/app/api/nostr/nip96/route.ts`, `src/app/api/blossom/upload/route.ts`.
- [x] **1.5. Suíte de Testes Automatizados da v2.40**
  - *Arquivos:* `nao_essenciais/tests/unit/v240_features.test.mjs` (27 testes unitários aprovados).

---

## 🟡 Próxima Onda: `v2.41.0` (Performance & Resiliência PWA)

> **Objetivo:** Garantir fluidez máxima a 60 FPS no feed mobile e suporte robusto para uso offline.

- [ ] **2.1. R-SOC-02 Múltiplos Álbuns de Fotos com Privacidade Orkut**
  - *Descrição:* Criação de álbuns temáticos de pets com permissões (Público, Apenas Amigos, Privado).
  - *Arquivos:* `src/app/api/albums/route.ts`, `src/components/ProfileAlbums.tsx`.
- [ ] **2.2. Cache Local de Eventos Nostr em IndexedDB**
  - *Descrição:* Persistência de notas, perfis e feeds Nostr em IndexedDB no navegador, reduzindo requisições aos relays.
  - *Arquivos:* `src/lib/nostr/storage-cache.ts`, `src/lib/nostr/events.ts`.
- [ ] **2.3. Virtualização de Listas no Feed Principal**
  - *Descrição:* Rolagem fluida com `@tanstack/react-virtual` no `FeedInfinite.tsx` para milhares de posts sem consumo excessivo de memória.
  - *Arquivos:* `src/components/FeedInfinite.tsx`.

---

## 🟢 Próxima Onda: `v2.42.0` (Soberania de Relé & Áudio em Segundo Plano)

> **Objetivo:** Infraestrutura descentralizada completa e experiência multimídia interativa.

- [ ] **3.1. R-SOC-05 Sorte do Dia no Feed**
  - *Descrição:* Card interativo matinal com frases caninas de sabedoria e horóscopo da matilha.
  - *Arquivos:* `src/components/DailyFortuneCard.tsx`, `src/lib/fortune.ts`.
- [ ] **3.2. Sessão de Áudio Persistente para "Latidos ao Vivo"**
  - *Descrição:* Player WebRTC flutuante no layout global para navegar pelo app sem interromper a transmissão de voz.
  - *Arquivos:* `src/components/GlobalAudioFloatingBar.tsx`, `src/components/LiveVoiceRoom.tsx`.
- [ ] **3.3. Relé Nostr Local no Docker Compose**
  - *Descrição:* Subir relé Khatru leve diretamente na infraestrutura Docker para latência ultrabaixa de eventos locais.
  - *Arquivos:* `docker-compose.yml`, `relays/khatru/`.

---

## 📊 Matriz de Rastreabilidade de Versões

| Versão | Status | Foco | Entregáveis |
|:---:|:---:|:---|:---|
| **v2.39.0** | Concluído | Redesign & Cores | TopBar Clean, User Dropdown, 5 Paletas Orkut |
| **v2.40.0** | Concluído | Linter, Scrapbook, Cinelar & Nostr Media | R-SOC-01, R-SOC-03, R-DIS-01, R-NOS-11, Lint React 19, 27 testes |
| **v2.41.0** | Planejado | Álbuns & Performance | R-SOC-02, Virtualização Feed, IndexedDB Cache |
| **v2.42.0** | Planejado | Sorte do Dia & Áudio Global | R-SOC-05, Floating Audio Player, Relé Nostr Docker |
