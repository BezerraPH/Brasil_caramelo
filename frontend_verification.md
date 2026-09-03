# Plano Estruturado de Verificação de Frontend (UI/UX, Componentes, Estado & Performance)
**Projeto:** Brasil Caramelo Nostr  
**Versão Base:** v2.38.0-alpha.0  
**Data de Criação:** 03/09/2026  
**Papel:** Arquiteto de Software & Especialista em Frontend, UI/UX & Acessibilidade

---

## 🎯 Objetivo e Diretrizes de Execução

Este documento estabelece um plano de auditoria e revisão minuciosa para **100% das páginas, componentes, hooks e estilos do frontend** do repositório.

### Regras Mandatórias de Execução
1. **Leitura Integral:** Ao executar o comando `"Execute a Fase X do frontend_verification.md"`, o agente deve inspecionar arquivo por arquivo pertencente àquela fase, sem assumir comportamentos e sem generalizações.
2. **Critério de Reporte:** Cada apontamento deve conter:
   - Componente / Página e linha(s) exata(s).
   - Classificação: `[VISUAL/LAYOUT]`, `[ACESSIBILIDADE/A11Y]`, `[PERFORMANCE/RENDER]`, `[CÓDIGO LEGADO]`, `[SUGESTÃO UX/FEATURE]`.
   - Evidência do problema (ex: quebra em viewport móvel, falta de aria-label, re-render desnecessário).
   - Solução proposta com código ou diretriz de design.
3. **Atualização de Status:** Ao finalizar a auditoria de cada fase, o status deve ser atualizado de `[ ] Pendente` para `[x] Concluído`, registrando a data e o resumo dos achados.

---

## 📊 Matriz de Status de Varredura por Tela / Módulo

| Fase | Módulo / Fluxo de Usuário | Total de Arquivos | Status | Responsável / Data |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1** | Shell da Aplicação, Layout Global, Shell & Design System | 24 | [ ] Pendente | — |
| **Fase 2** | Autenticação, Onboarding, Login Nostr & Recuperação | 18 | [ ] Pendente | — |
| **Fase 3** | Feed Principal, Criação, Exibição & Interação de Posts | 36 | [ ] Pendente | — |
| **Fase 4** | Mídia Rica, Players de Vídeo/Áudio, Stories & Reels | 22 | [ ] Pendente | — |
| **Fase 5** | Perfis de Usuário, Sistema Pet Diário, Matilha & Social | 32 | [ ] Pendente | — |
| **Fase 6** | Mensagens em Tempo Real, Chat Privado & Salas LiveKit | 26 | [ ] Pendente | — |
| **Fase 7** | Adoção de Animais, Pet Shops, Mapa & Geolocalização | 28 | [ ] Pendente | — |
| **Fase 8** | Tribunal Comunitário, Moderação, Gamificação & Configurações | 30 | [ ] Pendente | — |

---

## 🔬 FASES DETALHADAS DE AUDITORIA

---

### 🔹 FASE 1: Shell da Aplicação, Layout Global & Design System

#### 📂 Arquivos Sob Auditoria:
* `src/app/layout.tsx`
* `src/app/globals.css`
* `src/components/NavBar.tsx`
* `src/components/BottomNav.tsx`
* `src/components/Header.tsx`
* `src/components/Sidebar.tsx`
* `src/components/ThemeToggle.tsx`
* `src/components/Footer.tsx`
* `src/components/MobileMenu.tsx`
* `src/components/PWAInstallBanner.tsx`
* `src/components/OfflineIndicator.tsx`
* `src/components/Toast.tsx`
* Todos os componentes base em `src/components/ui/*`
* `public/manifest.json`
* `public/sw.js`

#### 📋 Checklist Específico da Fase:
- [ ] **Responsividade & Layout:** Safe areas no iOS/Android (entalhe/notch e barra de navegação inferior), consistência da barra de navegação fixa, comportamento em telas ultra-wide e tablets.
- [ ] **Acessibilidade (a11y):** Presença de `aria-label` em botões apenas com ícone (ex: tema, menu hambúrguer, notificações), foco visível para navegação por teclado (`:focus-visible`), hierarquia semântica de tags (`<nav>`, `<main>`, `<header>`).
- [ ] **Design System & Temas:** Coerência dos tokens de cor em Dark Mode e Light Mode (contraste mínimo WCAG AA de 4.5:1), ausência de cores e espaçamentos hardcoded fora do padrão de design.
- [ ] **PWA & Offline:** Funcionamento do Service Worker, instalação PWA sem avisos no console, comportamento quando offline.

---

### 🔹 FASE 2: Autenticação, Onboarding, Login Nostr & Recuperação

#### 📂 Arquivos Sob Auditoria:
* `src/app/(auth)/entrar/page.tsx`
* `src/app/(auth)/cadastrar/page.tsx`
* `src/app/(auth)/recuperar-senha/page.tsx`
* `src/app/(auth)/verificar/page.tsx`
* `src/components/AuthModal.tsx`
* `src/components/LoginForm.tsx`
* `src/components/RegisterForm.tsx`
* `src/components/NostrLoginForm.tsx`
* `src/components/ExtensionLoginPrompt.tsx`
* `src/components/NostrKeyImport.tsx`
* `src/hooks/useAuth.ts`
* `src/hooks/useNostrAuth.ts`
* Demais componentes do fluxo de autenticação

#### 📋 Checklist Específico da Fase:
- [ ] **Experiência do Usuário (UX):** Feedback claro em erros de credencial inválida, loading spinners durante login, suporte ao preenchimento automático do navegador (`autocomplete="username"`, `autocomplete="current-password"`).
- [ ] **Extensões Nostr (Alby, nos2x):** Detecção suave de extensões NIP-07 sem travar se o usuário não tiver extensão instalada; instruções claras de login com chave privada (nsec/npub).
- [ ] **Acessibilidade:** Mensagens de erro de formulário associadas via `aria-describedby` aos campos de input; acessibilidade em modais de autenticação (trap focus).
- [ ] **Sugestões de Features:** Adição de biometria WebAuthn / Passkeys para login rápido no mobile.

---

### 🔹 FASE 3: Feed Principal, Criação, Exibição & Interação de Posts

#### 📂 Arquivos Sob Auditoria:
* `src/app/(app)/feed/page.tsx`
* `src/app/(app)/post/[id]/page.tsx`
* `src/components/FeedList.tsx`
* `src/components/PostCard.tsx`
* `src/components/CreatePostModal.tsx`
* `src/components/PostMedia.tsx`
* `src/components/CommentsModal.tsx`
* `src/components/CommentItem.tsx`
* `src/components/ReactionsBar.tsx`
* `src/components/ShareModal.tsx`
* `src/components/RecentActivity.tsx`
* `src/components/TrendingPosts.tsx`
* `src/components/BoostModal.tsx`
* `src/components/CapsuleTimerBadge.tsx`
* `src/hooks/useFeed.ts`
* `src/hooks/usePostInteractions.ts`

#### 📋 Checklist Específico da Fase:
- [ ] **Performance de Scroll & Render:** Otimização de virtualização de lista longa (prevenção de lentidão após rolar dezenas de posts), uso correto de chaves (`key`), memoização de `PostCard` para evitar re-render ao curtir outro post.
- [ ] **Mídia & Imagens:** Uso de `next/image` com dimensões explícitas, `priority` apenas no primeiro post do viewport (LCP) e `loading="lazy"` nos demais; tratamento de imagens quebradas (placeholder elegante).
- [ ] **Interações Otimistas:** Atualização visual imediata ao curtir, descurtir ou comentar, com rollback gracioso em caso de erro na rede.
- [ ] **UX de Criação:** Preview instantâneo de imagem/vídeo anexado, contador de caracteres, indicador visual de post agendado para Cápsula do Tempo.

---

### 🔹 FASE 4: Mídia Rica, Players de Vídeo/Áudio, Stories & Reels

#### 📂 Arquivos Sob Auditoria:
* `src/app/(app)/reels/page.tsx`
* `src/app/(app)/reels/[id]/page.tsx`
* `src/components/ReelPlayer.tsx`
* `src/components/ReelList.tsx`
* `src/components/VideoPlayer.tsx`
* `src/components/AudioPlayer.tsx`
* `src/components/StoriesBar.tsx`
* `src/components/StoryViewer.tsx`
* `src/components/StoryCreator.tsx`
* `src/components/MediaUploadModal.tsx`
* `src/components/VideoProgressBar.tsx`
* `src/hooks/useMediaPlayback.ts`

#### 📋 Checklist Específico da Fase:
- [ ] **Experiência Mobile nos Reels:** Snap scrolling vertical suave (`scroll-snap-type: y mandatory`), autoplay apenas do vídeo em foco no viewport e pausa dos vídeos fora da tela (economia de bateria e dados).
- [ ] **Players de Áudio e Vídeo:** Controles táteis amigáveis em mobile, suporte a picture-in-picture, mute automático inicial respeitando políticas dos navegadores, tratamento de buffering e conexão lenta.
- [ ] **Acessibilidade:** Controles com legendas/títulos claros, suporte a teclado (barra de espaço para pausar, setas para volume/tempo), suporte a audiodescrição ou texto alternativo.
- [ ] **Stories:** Transição suave entre stories com temporizador visual pausável ao segurar a tela.

---

### 🔹 FASE 5: Perfis de Usuário, Sistema Pet Diário, Matilha & Social

#### 📂 Arquivos Sob Auditoria:
* `src/app/(app)/perfil/[username]/page.tsx`
* `src/app/(app)/cachorro/page.tsx`
* `src/app/(app)/matilha/page.tsx`
* `src/app/(app)/seguidores/page.tsx`
* `src/components/ProfileHeader.tsx`
* `src/components/ProfileTabs.tsx`
* `src/components/PetCard.tsx`
* `src/components/PetDailyNavDot.tsx`
* `src/components/PetGallery.tsx`
* `src/components/AddPetModal.tsx`
* `src/components/EditProfileModal.tsx`
* `src/components/FollowButton.tsx`
* `src/components/BadgesGrid.tsx`
* `src/hooks/useProfile.ts`

#### 📋 Checklist Específico da Fase:
- [ ] **Layout de Perfil:** Banner de capa e foto de avatar responsivos com estados vazios/fallback quando o usuário não tiver foto cadastrada.
- [ ] **Gamificação do Pet Diário:** Feedback visual animado ao alimentar, passear ou cuidar do pet diário; indicador de streak de dias consecutivos.
- [ ] **Social Graph:** Botão Seguir/Deixar de Seguir com atualização otimista, listagem paginada de matilha/seguidores e badge de verificado Nostr (NIP-05).
- [ ] **UX & Refatoração:** Remoção de duplicidades de rotas ou botões na navegação.

---

### 🔹 FASE 6: Mensagens em Tempo Real, Chat Privado & Salas LiveKit

#### 📂 Arquivos Sob Auditoria:
* `src/app/(app)/chat/page.tsx`
* `src/app/(app)/chat/[roomId]/page.tsx`
* `src/app/(app)/live/page.tsx`
* `src/app/(app)/live/[roomId]/page.tsx`
* `src/components/ChatRoom.tsx`
* `src/components/ChatSidebar.tsx`
* `src/components/MessageList.tsx`
* `src/components/MessageItem.tsx`
* `src/components/MessageInput.tsx`
* `src/components/LiveRoom.tsx`
* `src/components/CallModal.tsx`
* `src/components/AudioWaveform.tsx`
* `src/hooks/useChat.ts`
* `src/hooks/useLiveKit.ts`

#### 📋 Checklist Específico da Fase:
- [ ] **Comportamento do Chat:** Auto-scroll para a mensagem mais recente apenas se o usuário já estiver no final da conversa; indicação de "digitando...", status de envio (enviando, entregue, lido).
- [ ] **Mobile Keyboard & Viewport:** Ajuste dinâmico da tela quando o teclado virtual do celular sobe (evitar que o campo de input fique oculto pelo teclado no iOS/Android).
- [ ] **Videochamada & Live:** Controles claros de microfone/câmera, indicador visual de conexão instável, grid adaptativo de participantes na transmissão ao vivo.
- [ ] **Acessibilidade:** Leitores de tela anunciando novas mensagens recebidas (`aria-live="polite"`).

---

### 🔹 FASE 7: Adoção de Animais, Pet Shops, Mapa & Geolocalização

#### 📂 Arquivos Sob Auditoria:
* `src/app/(app)/adocao/page.tsx`
* `src/app/(app)/adocao/[id]/page.tsx`
* `src/app/(app)/adocao/novo/page.tsx`
* `src/app/(app)/mapa/page.tsx`
* `src/app/(app)/petshop/page.tsx`
* `src/components/AdoptionCard.tsx`
* `src/components/AdoptionFilters.tsx`
* `src/components/AdoptionInterestModal.tsx`
* `src/components/MapView.tsx`
* `src/components/PetShopCard.tsx`
* `src/components/LocationPicker.tsx`
* `src/hooks/useAdoption.ts`
* `src/hooks/useGeolocation.ts`

#### 📋 Checklist Específico da Fase:
- [ ] **Filtros & Busca:** Filtros de espécie, porte, idade e região com transição suave e feedback visual quando nenhum animal for encontrado para os filtros selecionados.
- [ ] **Mapa Interativo:** Carregamento assíncrono dos scripts de mapa, marcadores agrupados (clustering) para evitar sobrecarga de renderização no mobile, suporte a permissão negada de GPS.
- [ ] **Formulário de Cadastro de Pet para Adoção:** Upload de fotos com ordenação, seleção de características com chips clicáveis, validação clara de campos obrigatórios.
- [ ] **UX de Adoção:** Botão de contato direto via Chat interno ou WhatsApp com mensagem pré-formatada.

---

### 🔹 FASE 8: Tribunal Comunitário, Moderação, Gamificação & Configurações

#### 📂 Arquivos Sob Auditoria:
* `src/app/(app)/tribunal/page.tsx`
* `src/app/(app)/tribunal/[id]/page.tsx`
* `src/app/(app)/ranking/page.tsx`
* `src/app/(app)/configuracoes/page.tsx`
* `src/app/admin/page.tsx`
* `src/components/TribunalCard.tsx`
* `src/components/TribunalVoteModal.tsx`
* `src/components/BadgesModal.tsx`
* `src/components/RankingList.tsx`
* `src/components/RoadmapPanel.tsx`
* `src/components/NotificationSettings.tsx`
* `src/components/RelaySettings.tsx`
* Demais páginas em `src/app/admin/*` e `src/app/(app)/configuracoes/*`

#### 📋 Checklist Específico da Fase:
- [ ] **Experiência do Tribunal:** Apresentação imparcial das evidências do post denunciado, contagem regressiva de votação, clareza sobre o impacto do voto na moderação comunitária.
- [ ] **Painel de Configurações:** Gerenciamento simples de relays Nostr conectados, opções de notificações Push, exportação de chaves criptográficas com proteção visual (ocultar com asteriscos).
- [ ] **Ranking & Gamificação:** Pódio visual para os top 3 membros da matilha, visualização detalhada de conquistas e progresso de XP.
- [ ] **Painel de Roadmap:** Sincronia perfeita entre o `ROADMAP.md` e o componente `RoadmapPanel.tsx` (itens em andamento vs concluídos).

---

## 📝 Protocolo de Reporte e Registro

Ao auditar cada fase, os resultados devem ser documentados com o seguinte padrão:

```markdown
### 📌 Relatório de Auditoria Frontend: [Fase X] - [Nome do Módulo]
- **Data:** DD/MM/AAAA
- **Arquivos Analisados:** X/X arquivos
- **Status:** [x] Concluído

#### 🔴 Inconsistências Críticas & Layout (UI/Responsividade)
* `caminho/Componente.tsx:L123` - [VISUAL/LAYOUT]: Evidência do erro de visual/responsividade e código corrigido.

#### 🟡 Acessibilidade & Navegação (a11y)
* `caminho/Componente.tsx:L45` - [A11Y]: Falta de aria-labels ou contraste insuficiente com recomendação WCAG.

#### ⚡ Performance & Re-renders
* `caminho/Componente.tsx:L88` - [PERFORMANCE]: Otimização de renderização, lazy loading ou memoização necessária.

#### 💡 Sugestões de UX & Novas Features
* `caminho/Componente.tsx:L110` - [SUGESTÃO UX]: Melhoria no fluxo do usuário ou microinteração recomendada.
```
