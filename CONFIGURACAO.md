# Brasil Caramelo — guia completo do servidor

**Este é o único tutorial de deploy e operação do projeto.**  
Todo o resto foi consolidado aqui (antes: DEPLOY, DNS-LOCAL, LIVEKIT, COTURN, TESTE, túneis separados).

Conteúdo: deploy, `.env`, HTTPS, Tailscale, Cloudflare, DNS local, diagnóstico e problemas comuns.

Stack: **um** `docker-compose.yml` + **um** `.env` → app, PostgreSQL, Soketi, coturn, LiveKit.

---

## Índice

1. [Início rápido](#1-início-rápido)
2. [Estrutura do projeto](#2-estrutura-do-projeto)
3. [Variável `BC_HOST` e `.env`](#3-variável-bc_host-e-env)
4. [Serviços Docker](#4-serviços-docker)
5. [Escolher modo de acesso](#5-escolher-modo-de-acesso)
6. [Modo A — HTTP na LAN (simples)](#6-modo-a--http-na-lan-simples)
7. [Modo B — HTTPS na LAN (mkcert)](#7-modo-b--https-na-lan-mkcert)
8. [Modo C — Tailscale (recomendado)](#8-modo-c--tailscale-recomendado)
9. [Modo D — Cloudflare Tunnel](#9-modo-d--cloudflare-tunnel)
10. [DNS local (`brasilcaramelo.com` sem registrar domínio)](#10-dns-local-brasilcaramelocom-sem-registrar-domínio)
11. [Diagnóstico e smoke tests](#11-diagnóstico-e-smoke-tests)
12. [Problemas comuns](#12-problemas-comuns)
13. [Comandos úteis](#13-comandos-úteis)
14. [Ollama e backup](#14-ollama-e-backup)
15. [Testes manuais](#15-testes-manuais) (incl. Cinelar FYP v2.19)
16. [Vídeo HLS (opcional)](#16-vídeo-hls-opcional)
17. [Histórico e Gitea](#17-histórico-e-gitea)
18. [Checklist produção v2.28+](#18-checklist-produção-v228) (Premium, push, Meili, MinIO…)

---

## 1. Início rápido

No servidor Ubuntu (`ntek-servidor` ou similar):

```bash
cd ~/brasil_caramelo
git pull origin main

chmod +x scripts/*.sh
./scripts/setup-env.sh          # cria .env com IP detectado
# ou: cp .env.example .env && nano .env

docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Atalhos de deploy:

```bash
./scripts/deploy-brasil-caramelo.sh                    # HTTP LAN
./scripts/deploy-brasil-caramelo.sh --mode tailscale   # Tailscale (celular)
./scripts/deploy-brasil-caramelo.sh --mode https       # mkcert na LAN
./scripts/deploy-brasil-caramelo.sh --audit            # + auditoria rápida
./scripts/deploy-brasil-caramelo.sh --smoke            # + smoke tests HTTP
./scripts/deploy-brasil-caramelo.sh --full             # smoke + auditoria (recomendado pós-deploy)
```

Alias: `./scripts/deploy-ubuntu.sh` (mesmas opções). Índice dos scripts: `scripts/README.md`.

Acesso inicial: **http://SEU_IP:3000** (ex.: `http://192.168.1.4:3000`).

**Microfone, Latidos e chamadas no celular exigem HTTPS** — escolha um modo na [seção 5](#5-escolher-modo-de-acesso).

---

## 2. Estrutura do projeto

```
brasil_caramelo/
  docker-compose.yml       ← stack completa (não use outro compose)
  .env                     ← você cria a partir de .env.example
  CONFIGURACAO.md          ← este guia (tutorial único)
  docs/ESTRUTURA.md        ← mapa de pastas do código
  deploy/
    livekit/livekit.yaml   ← node_ip deve bater com o modo de acesso
    nginx/                 ← configs nginx (LAN, túnel, tailscale)
  scripts/
    README.md              ← índice de todos os scripts
    setup-env.sh           ← gera .env com IP
    deploy-brasil-caramelo.sh ← deploy completo (--mode http|https|tailscale)
    deploy-ubuntu.sh       ← alias do deploy acima
    setup-https-lan.sh     ← HTTPS mkcert na LAN
    setup-tailscale.sh     ← Tailscale + serve
    setup-cloudflare-tunnel.sh
    server-audit.sh          ← auditoria + smoke
    server-smoke.sh
    cron-maintenance.example  ← cron horário (batalhas, stories, trending)
    cron-backup.example
```

---

## 3. Variável `BC_HOST` e `.env`

`BC_HOST` é o **hostname ou IP** que o navegador do celular/PC usa para falar com o servidor.

```env
BC_HOST=192.168.1.4
```

Depois de mudar `BC_HOST` ou qualquer `NEXT_PUBLIC_*`:

```bash
docker compose up -d --build
```

### 3.1 App

| Variável | Valor típico (HTTP LAN) |
|----------|-------------------------|
| `BC_HOST` | `192.168.1.4` |
| `APP_URL` | `http://192.168.1.4:3000` |
| `NEXT_PUBLIC_APP_URL` | igual ao `APP_URL` |
| `COOKIE_SECURE` | `false` (HTTP) ou `true` (HTTPS) |

### 3.2 Soketi (chat / tempo real)

| Variável | Valor |
|----------|-------|
| `PUSHER_HOST` | `soketi` (**nome Docker — não mude**) |
| `NEXT_PUBLIC_PUSHER_HOST` | IP ou hostname que o **celular** enxerga |
| `PUSHER_KEY` / `NEXT_PUBLIC_PUSHER_KEY` | `caramelo_key_local` |

**Erro comum:** `NEXT_PUBLIC_PUSHER_HOST=localhost` — não funciona no celular.

Com HTTPS via nginx (portas 443 / 6443):

```env
NEXT_PUBLIC_PUSHER_HOST=brasilcaramelo.com
NEXT_PUBLIC_PUSHER_PORT=6443
NEXT_PUBLIC_PUSHER_USE_TLS=true
```

Com Tailscale / túnel (tudo na 443):

```env
NEXT_PUBLIC_PUSHER_HOST=ntek-servidor.sua-tailnet.ts.net
NEXT_PUBLIC_PUSHER_PORT=443
NEXT_PUBLIC_PUSHER_USE_TLS=true
```

### 3.3 coturn (vídeo em /mensagens)

```env
NEXT_PUBLIC_STUN_URL=stun:192.168.1.4:3478
NEXT_PUBLIC_TURN_URL=turn:192.168.1.4:3478
NEXT_PUBLIC_TURN_USERNAME=caramelo
NEXT_PUBLIC_TURN_CREDENTIAL=caramelo_turn_secret
```

No modo Tailscale, use o IP `100.x.x.x` (`tailscale ip -4`) em STUN/TURN.

### 3.4 LiveKit (Latidos)

```env
NEXT_PUBLIC_LIVEKIT_URL=ws://192.168.1.4:7880
LIVEKIT_API_KEY=caramelo_livekit_key
LIVEKIT_API_SECRET=caramelo_livekit_secret_change_me
```

Em `deploy/livekit/livekit.yaml`:

```yaml
rtc:
  use_external_ip: false
  node_ip: 192.168.1.4   # LAN — ou IP Tailscale no modo C
```

Altere o secret no yaml e no `.env`. Após editar: `docker compose restart livekit coturn`.

Rotas no app: `/latidos` (lista) e `/latidos/[slug]` (sala).

| Cenário chamada vídeo (coturn) | TURN necessário? |
|--------------------------------|------------------|
| Dois aparelhos na mesma Wi‑Fi | Em geral não |
| Celular 4G ↔ Wi‑Fi | Sim |

### 3.5 Pedigree (PIX e Mercado Pago) — v2.21+

| Variável | Uso |
|----------|-----|
| `PEDIGREE_PIX_KEY` | Chave PIX exibida em `/premium` |
| `PEDIGREE_PRICE_BRL` | Valor (ex. `19.90`) |
| `PREMIUM_WEBHOOK_SECRET` | Confirma pagamento em `POST /api/premium/webhook` |
| `MERCADOPAGO_ACCESS_TOKEN` | Checkout MP + `POST /api/premium/webhook/mercadopago` |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | URLs de retorno do MP |

Fluxo: usuário em `/premium` → **Gerar pedido PIX** → referência `BC-{USERNAME}-{XXXX}` na descrição do PIX.  
Webhook manual (corpo JSON): `{ "status": "approved", "reference": "BC-..." }` com header `X-Webhook-Secret` ou `secret` no body.  
Códigos demo (`PEDIGREE`, `MATILHA`) continuam em `POST /api/premium` para dev.

Após deploy v2.21: `docker compose exec -T app npx prisma migrate deploy`.

### 3.6 Pet shops parceiros (v2.22+)

| Recurso | Descrição |
|---------|-----------|
| `NEXT_PUBLIC_PET_SHOP_REGION` | Região padrão (ex. `Recife`, `Caruaru`) |
| `/pet-shops` | Mapa e lista por bairro |
| Radar do perfil | `locationCity` / `locationArea` em /configuracoes ordenam parceiros |

Cupons no banco (`PetShopCoupon`) — migração v2.22 adiciona endereço e coordenadas.  
API: `GET /api/pet-shop/partners?region=Recife&city=Recife`

### 3.7 WebRTC debug (v2.22+)

Em **/configuracoes → WebRTC avançado**: teste de candidatos ICE (host, srflx, relay).  
Durante chamada em **/mensagens**, o overlay mostra **P2P direto** ou **Via TURN**.  
Configure `NEXT_PUBLIC_STUN_URL` e `NEXT_PUBLIC_TURN_URL` (coturn no compose).

### 3.8 Meilisearch (v2.23+)

| Variável | Uso |
|----------|-----|
| `MEILISEARCH_HOST` | URL interna (`http://meilisearch:7700` no Docker) |
| `MEILISEARCH_MASTER_KEY` | Chave master (igual no compose) |

Container `meilisearch` na porta **7700** (localhost). Sem Meili, `/buscar` usa SQL.

Após primeiro deploy com Meili:

```bash
./scripts/reindex-meilisearch.sh
# ou: curl -X POST "$APP_URL/api/cron/maintenance?reindex=1" -H "Authorization: Bearer $CRON_SECRET"
```

Índices: `bc_users`, `bc_posts`. Sincronização incremental ao criar recado ou editar perfil.

### 3.9 Push PWA na tailnet (v2.23+)

```bash
./scripts/generate-vapid-keys.sh   # copie para .env
```

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Chave pública (client + SW) |
| `VAPID_PRIVATE_KEY` | Servidor — **não commitar** |
| `VAPID_SUBJECT` | `mailto:` ou URL do app |

Em **/configuracoes → Push na matilha**, o usuário ativa notificações do sistema.  
Funciona com **HTTPS** (Tailscale Serve ou mkcert). Complementa Pusher (sino ao vivo).

### 3.10 Redis, métricas ops e CI (v2.24+)

| Variável | Uso |
|----------|-----|
| `REDIS_URL` | Cache e rate limit (`redis://redis:6379` no Docker) |

Container **redis** no `docker-compose.yml`. Sem Redis, o app usa LRU em memória (menos eficiente em múltiplas réplicas).

Cache quente: lista de Matilhas (`/api/packs`), pet do usuário (`GET /api/pet`), trends da Matilha.

**Observabilidade** (painel em Matilha → saúde da stack + `GET /api/ops/metrics` com `Authorization: Bearer $CRON_SECRET`):

- Falhas HLS no player (`BcVideo`)
- Flush da fila offline de recados
- Eventos genéricos via `POST /api/ops/event` (cliente autenticado)

**CI local / GitHub:** workflow `.github/workflows/ci.yml` — lint, build, migrate Postgres, `npm run validate:smoke`.

**Backup:** `./scripts/backup-matilha.sh` (pg_dump + tarball uploads, retenção `RETENTION_DAYS=14`).  
Agendar: `./scripts/setup-backup-cron.sh` ou `scripts/cron-backup.example`.

### 3.11 MinIO / S3 para mídia (v2.25+)

| Variável | Uso |
|----------|-----|
| `S3_ENDPOINT` | URL do MinIO (`http://minio:9000` no Docker) |
| `S3_ACCESS_KEY` | Usuário (igual `MINIO_ROOT_USER` no compose) |
| `S3_SECRET_KEY` | Senha (igual `MINIO_ROOT_PASSWORD`) |
| `S3_BUCKET` | Bucket (`bc-media` padrão) |
| `S3_REGION` | `us-east-1` (MinIO ignora, SDK exige) |

Container **minio** nas portas **9000** (API) e **9001** (console, localhost).  
Se `S3_ENDPOINT` estiver preenchido, uploads vão para o bucket; URLs públicas continuam em `/api/media/…`.  
Sem S3, use `UPLOAD_DIR` como antes.

```bash
./scripts/setup-minio-bucket.sh   # checagem de saúde
```

Painel em **/configuracoes → Armazenamento** mostra badge **Disco** ou **S3**.  
Backup: `backup-matilha.sh` ainda copia `data/uploads`; com MinIO, inclua volume `minio_data` no backup do host.

### 3.12 Comunidades e LGPD (v2.26+)

| Recurso | Onde |
|---------|------|
| Comunidades Orkut | `/comunidades` — participar, temas por categoria |
| Exportar dados | `/configuracoes` → **Exportar meus dados** ou `GET /api/users/me/export` |

A migração `20260609120000_v226_communities` cria tabelas e 6 comunidades demo.  
Limite de exportação: 3 downloads JSON por hora por conta.

### 3.13 Federação Tailscale (v2.27+)

| Variável | Uso |
|----------|-----|
| `FEDERATION_EXPORT_SECRET` | Segredo compartilhado entre servidores (recomendado na tailnet) |

```bash
./scripts/setup-federation-tailscale.sh
```

Em **/configuracoes → Caramelo-Sync**: aba **Tailscale**, URL `https://outro-servidor.tailXXXX.ts.net` (HTTPS obrigatório).  
Use **Testar** (`POST /api/federation/peers/{id}/probe`) antes de sincronizar.

### 3.14 App nativo Capacitor (v2.27+)

O app nativo carrega seu servidor (não embute o build Next no APK).

```bash
CAPACITOR_SERVER_URL=https://seu-host.tailXXXX.ts.net ./scripts/setup-capacitor.sh
npm run cap:open:android
```

Pastas `android/` e `ios/` são geradas localmente (no `.gitignore`).  
Painel em **/configuracoes → App nativo (Capacitor)**.

### 3.15 Opcional

| Variável | Uso |
|----------|-----|
| `PREMIUM_CODE` | Pedigree (legado) |
| `NEXT_PUBLIC_PET_SHOP_REGION` | `Recife` ou `Caruaru` |
| `BC_SMOKE_EMAIL` / `BC_SMOKE_PASSWORD` | Conta para smoke tests |
| `OLLAMA_BASE_URL` | IA local (seção 14) |

`OPENAI_API_KEY` pode ficar vazio — moderação e Cão de Guarda usam Ollama local quando configurado.

---

## 4. Serviços Docker

| Container | Porta | Função |
|-----------|-------|--------|
| **app** | 3000 | Next.js |
| **db** | 5432 (localhost) | PostgreSQL |
| **soketi** | 6001 | WebSocket / Pusher |
| **coturn** | 3478 | TURN/STUN |
| **livekit** | 7880–7881, UDP 50000–50100 | Latidos |
| **meilisearch** | 7700 (localhost) | Busca rápida |
| **redis** | 6379 (interno) | Cache + rate limit |
| **minio** | 9000–9001 (localhost) | Mídia S3 (opcional) |

Convive com outros containers no mesmo host (Gitea 3001, Nextcloud 8080, Portainer 8000, etc.) — portas diferentes, sem conflito.

---

## 5. Escolher modo de acesso

> **Use um modo por vez.** Não rode `setup-https-lan.sh` depois de `setup-tailscale.sh --serve` (o `.env` volta para `brasilcaramelo.com` e o celular via Tailscale quebra). Escolha C **ou** B e faça `docker compose up -d --build`.

O nome **`brasilcaramelo.com` não precisa existir na internet** — era só apelido local (hosts + mkcert). Pode ignorar se usar Tailscale ou túnel.

| Modo | Config no celular | HTTPS | Latidos / microfone | Melhor para |
|------|-------------------|-------|---------------------|-------------|
| **A — HTTP LAN** | Nenhuma | Não | Não no celular | Teste rápido no PC |
| **B — HTTPS LAN (mkcert)** | hosts + CA em cada aparelho | Sim | Sim na Wi‑Fi | Casa, sem Tailscale |
| **C — Tailscale** | App Tailscale (1×) | Sim (`serve`) | **Sim** | **Você já usa Tailscale** |
| **D — Cloudflare Tunnel** | Só abrir o link | Sim | Limitado (UDP) | Visitante sem Tailscale |

**Recomendação:** se `tailscaled` já roda no servidor → [Modo C](#8-modo-c--tailscale-recomendado).

---

## 6. Modo A — HTTP na LAN (simples)

```bash
./scripts/setup-env.sh
docker compose up -d --build
```

Acesse: `http://192.168.1.4:3000`

- Login e feed funcionam.
- **Celular:** microfone, Latidos e chamadas **não** funcionam de forma confiável (bloqueio de mídia em HTTP).

---

## 7. Modo B — HTTPS na LAN (mkcert)

Navegadores no Android/iOS **bloqueiam microfone** em `http://192.168.1.4:3000`.

### 7.1 Servidor

```bash
cd ~/brasil_caramelo
sudo apt install mkcert libnss3-tools nginx
mkcert -install
mkcert brasilcaramelo.com 192.168.1.4

bash scripts/setup-https-lan.sh
docker compose up -d --build
docker compose restart livekit coturn
bash scripts/server-audit.sh
```

O script:

- Copia certificados para `/etc/ssl/`
- Configura nginx nas portas **443** (app), **6443** (Soketi), **7443** (LiveKit)
- Adiciona `brasilcaramelo.com` em `/etc/hosts` do servidor se ainda não resolver
- Ajusta `.env` (backup `.env.bak.https`)

**Porta 80 ocupada (Apache/httpd):** o redirect HTTP→HTTPS é omitido. Acesse `https://` direto ou `bash scripts/setup-https-lan.sh --force-80`.

### 7.2 PC Windows (administrador)

Arquivo `C:\Windows\System32\drivers\etc\hosts`:

```
192.168.1.4    brasilcaramelo.com
192.168.1.4    www.brasilcaramelo.com
```

Instale a CA mkcert (senão o navegador recusa HTTPS):

```bash
# No servidor:
mkcert -CAROOT
# Copie rootCA.pem para o PC → Instalar certificado →
# Autoridades de certificação raiz confiáveis → Computador local
```

### 7.3 Celular

Instale `rootCA.pem` no aparelho e use **`https://brasilcaramelo.com`** (sem `:3000`).

### 7.4 `.env` após o script

```env
APP_URL=https://brasilcaramelo.com
NEXT_PUBLIC_APP_URL=https://brasilcaramelo.com
COOKIE_SECURE=true
NEXT_PUBLIC_LIVEKIT_URL=wss://brasilcaramelo.com:7443
NEXT_PUBLIC_PUSHER_HOST=brasilcaramelo.com
NEXT_PUBLIC_PUSHER_PORT=6443
NEXT_PUBLIC_PUSHER_USE_TLS=true
```

`livekit.yaml` → `node_ip: 192.168.1.4`

---

## 8. Modo C — Tailscale (recomendado)

Você já tem **Tailscale node agent** no servidor. Melhor que Cloudflare para Latidos (UDP WebRTC na tailnet).

### 8.1 Passo a passo

```bash
cd ~/brasil_caramelo
git pull origin main

tailscale status
tailscale ip -4

bash scripts/setup-tailscale.sh
sudo bash scripts/setup-tailscale.sh --serve

nano deploy/livekit/livekit.yaml
#   node_ip: 100.x.x.x    # mesmo de: tailscale ip -4
#   use_external_ip: false

docker compose restart livekit coturn
docker compose up -d --build
bash scripts/server-audit.sh
```

No celular/PC: **Tailscale ligado** → abra `https://ntek-servidor.sua-tailnet.ts.net` (URL exata no output do script).

Sem hosts, sem `rootCA.pem`, sem domínio registrado.

### 8.2 Como funciona

```text
[Celular com Tailscale]
        │  HTTPS (certificado tailnet)
        ▼
[tailscale serve :443]
        │  http://127.0.0.1:8780
        ▼
[nginx — app + /app Soketi + /rtc LiveKit]
        ▼
[Docker: app, soketi, livekit, coturn]
```

### 8.3 URLs de referência

| Situação | URL |
|----------|-----|
| Tailscale + serve | `https://ntek-servidor....ts.net` |
| Só IP tailnet (sem serve) | `http://100.x.x.x:3000` (sem HTTPS → sem mic no celular) |
| Gitea no mesmo servidor | `http://100.94.55.27:3001` (exemplo) |
| LAN com mkcert | `https://brasilcaramelo.com` |

Não misture modos B e C no `.env` sem `docker compose up -d --build`.

### 8.3.1 Checklist pós-deploy (Tailscale)

```bash
sudo bash scripts/deploy-brasil-caramelo.sh --mode tailscale --full
# Esperado: smoke FAIL=0, auditoria WARN=0 FAIL=0
```

| Verificação | Como |
|-------------|------|
| Health | `curl -s https://SEU_HOST.ts.net/api/health` → `"ok":true` |
| Celular | App Tailscale + mesma URL HTTPS |
| Cron | `CRON_SECRET` no `.env` + `scripts/cron-maintenance.example` |
| Git | `bash scripts/sync-from-git.sh` se `scripts/` aparecer modificado |

`sync-from-git.sh` descarta alterações locais em `scripts/` e `livekit.yaml` antes do `git pull` (normal após Tailscale).

### 8.4 Tailscale Funnel (público, opcional)

Expõe na internet sem app Tailscale no visitante (cuidado):

```bash
sudo tailscale funnel --bg --https=443 http://127.0.0.1:8780
```

Para família na tailnet, **`tailscale serve`** basta.

### 8.5 Voltar para LAN (mkcert)

```bash
bash scripts/setup-https-lan.sh
# livekit.yaml → node_ip: 192.168.1.4
docker compose up -d --build
```

---

## 9. Modo D — Cloudflare Tunnel

Use só se precisar que **alguém sem Tailscale** abra o app. **Latidos/microfone** costumam falhar (UDP não passa pelo túnel).

### 9.1 Quick Tunnel (grátis, sem domínio)

```bash
cd ~/brasil_caramelo
bash scripts/setup-cloudflare-tunnel.sh

# Outro terminal — deixe rodando:
cloudflared tunnel --url http://127.0.0.1:8780

# Copie a URL https://....trycloudflare.com
bash scripts/setup-cloudflare-tunnel.sh --env-only https://SUA-URL.trycloudflare.com
docker compose up -d --build
```

Background:

```bash
nohup cloudflared tunnel --url http://127.0.0.1:8780 >> /tmp/cloudflared-bc.log 2>&1 &
grep -o 'https://[^ ]*trycloudflare.com' /tmp/cloudflared-bc.log | tail -1
```

A URL **muda** ao reiniciar. Para URL fixa: [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → Networks → Tunnels.

### 9.2 Limitação LiveKit

| Funciona | Pode falhar |
|----------|-------------|
| Site, login, feed, chat | Latidos / microfone (UDP) |

Alternativas para mídia: Tailscale, portas no roteador, LiveKit Cloud.

### 9.3 Voltar para outro modo

```bash
bash scripts/setup-https-lan.sh    # LAN
# ou
bash scripts/setup-tailscale.sh --serve
docker compose up -d --build
```

---

## 10. DNS local (`brasilcaramelo.com` sem registrar domínio)

O nome só precisa **resolver na sua rede** para o IP do servidor.

### 10.1 Arquivo hosts (por aparelho)

**Windows** (Bloco de notas como administrador) — `C:\Windows\System32\drivers\etc\hosts`:

```
192.168.1.4    brasilcaramelo.com
192.168.1.4    www.brasilcaramelo.com
```

**Linux/macOS:** `sudo nano /etc/hosts` — mesmas linhas.

### 10.2 DNS no roteador (toda a Wi‑Fi)

Registro local: `brasilcaramelo.com` → `192.168.1.4` (nome varia: TP-Link, Intelbras, Ubiquiti…).

### 10.3 dnsmasq no servidor Ubuntu

```bash
sudo apt install dnsmasq
```

`/etc/dnsmasq.d/brasilcaramelo.conf`:

```
address=/brasilcaramelo.com/192.168.1.4
address=/www.brasilcaramelo.com/192.168.1.4
```

```bash
sudo systemctl restart dnsmasq
```

No roteador, DNS primário dos clientes = `192.168.1.4`.

### 10.4 Tailscale (MagicDNS)

Use o hostname `ntek-servidor....ts.net` — não precisa de `brasilcaramelo.com`. Ver [modo C](#8-modo-c--tailscale-recomendado).

### 10.5 Resumo DNS

| Método | Quem configura |
|--------|----------------|
| hosts | Cada PC/celular |
| Roteador | Uma vez na rede |
| dnsmasq | Servidor + roteador |
| Tailscale MagicDNS | Admin Tailscale |

---

## 11. Diagnóstico e smoke tests

```bash
chmod +x scripts/*.sh

./scripts/setup-smoke-account.sh   # conta smoke no banco
bash scripts/server-audit.sh       # relatório completo
bash scripts/server-audit.sh --quick
bash scripts/server-audit.sh --smoke-only
bash scripts/server-smoke.sh
```

Variáveis opcionais: `BC_SMOKE_EMAIL`, `BC_SMOKE_PASSWORD` no `.env`.

**Auditoria OK esperada:** `WARN=0 FAIL=0`, smoke `57 OK` (com HTTPS e DNS/hosts corretos).

Se `brasilcaramelo.com` não resolve no servidor: `bash scripts/setup-https-lan.sh` ou smoke usa `127.0.0.1` + header Host automaticamente.

---

## 12. Problemas comuns

| Problema | Solução |
|----------|---------|
| Login não persiste | `COOKIE_SECURE` deve bater com HTTP/HTTPS |
| Chat sem tempo real | `docker compose ps` — soketi Up; `NEXT_PUBLIC_PUSHER_HOST` = IP/hostname do celular |
| Latidos não conecta | `livekit` Up; `node_ip` = IP que o cliente alcança; `use_external_ip: false` |
| Microfone no celular | HTTPS (modo B, C ou D); não use HTTP `:3000` |
| Não atende chamada | HTTPS + logado (CallProvider global) |
| Vídeo chamada 409 | Sessão travada — expira em ~3 min |
| `server-audit` 38 FAIL | DNS — `setup-https-lan.sh` ou `git pull` + audit |
| Porta 80 ocupada | Apache/httpd — use `https://` direto |
| Mudou `.env` e nada mudou | `docker compose up -d --build` |
| Domínio “não existe” | Normal — use Tailscale ou hosts local |
| `Argumento desconhecido: --full` | `git pull` (correção no script) ou use `--smoke --audit` juntos |
| `CRON_SECRET=` vazio | `bash scripts/ensure-cron-secret.sh` e `docker compose up -d --build` |
| `git pull` bloqueado em deploy script | `bash scripts/sync-from-git.sh` ou `git checkout -- scripts/deploy-brasil-caramelo.sh && git pull` |
| Smoke FAIL em register/reputation/premium | `git pull` (v2.9.2+) e `docker compose up -d --build` |
| `nginx.service failed` no deploy Tailscale | `sudo bash scripts/fix-nginx-tailscale.sh` — só porta **8780** (sem vhosts 80/443) |
| Cinelar sem ordem “For You” | Migração v2.19: `docker compose exec -T app npx prisma migrate deploy` |

---

## 13. Comandos úteis

```bash
docker compose ps
docker compose logs app
docker compose logs livekit
docker compose restart livekit coturn
docker compose up -d --build
docker compose down

bash scripts/setup-env.sh
bash scripts/setup-https-lan.sh
bash scripts/setup-tailscale.sh --serve
bash scripts/setup-cloudflare-tunnel.sh

sudo ss -tlnp | grep ':80'
sudo systemctl status nginx tailscaled

bash scripts/server-audit.sh
./scripts/backup-matilha.sh
```

---

## 14. Ollama e backup

### Ollama (opcional)

```bash
ollama pull llama3.2
ollama pull moondream
```

```env
OLLAMA_BASE_URL=http://192.168.1.4:11434
OLLAMA_MODEL=llama3.2
OLLAMA_VISION_MODEL=moondream
```

### Backup

```bash
chmod +x scripts/backup-matilha.sh
./scripts/backup-matilha.sh
```

Agendamento: `scripts/cron-backup.example`.

### Manutenção automática (recomendado)

O feed **não** executa mais limpeza pesada a cada carregamento. Use cron no servidor:

```bash
# .env — defina CRON_SECRET (string longa aleatória)
CRON_SECRET=sua_chave_secreta_aqui
```

```bash
curl -fsS -X POST "http://127.0.0.1:3000/api/cron/maintenance" \
  -H "x-cron-secret: SUA_CRON_SECRET"
```

Resposta esperada: `{"ok":true,"battlesFinalized":...,"storiesPurged":...,"trendsRefreshed":...}`

Agendamento horário: `scripts/cron-maintenance.example` (junto com backup em `cron-backup.example`).

O deploy (`deploy-brasil-caramelo.sh`) tenta rodar a manutenção inicial automaticamente se `CRON_SECRET` estiver definido.

---

## 15. Testes manuais

Além de `bash scripts/server-audit.sh`:

```bash
curl -s http://localhost:3000/api/health   # no servidor → ok: true
```

No navegador (mesma rede ou Tailscale):

1. Abrir a URL do modo escolhido (ex. `https://ntek-servidor....ts.net`)
2. Criar conta → Feed → publicar recado
3. Segunda conta → curtir / reputação no perfil
4. **v2.19** — Modo Cinelar (patinha): badge “For You”; assistir vídeos (ranking por retenção)
5. **v2.19** — `/matilhas` → enquetes no topo do fórum; perfil Orkut → fotos na coluna direita
6. **v2.20** — Matilhas filtro 🔥 Quentes; perfil Orkut pills de reputação; configurações → radar com duplo opt-in

**Dev no Windows:**

```powershell
docker compose up db -d
copy .env.example .env
npm install && npx prisma generate && npm run db:deploy
npm run dev
```

**Git no PC (erro “untracked working tree”):**

```powershell
git fetch origin
git reset --hard origin/main
```

**URLs de referência (anote as suas):**

| Item | Exemplo |
|------|---------|
| App | `http://192.168.1.4:3000` ou URL Tailscale |
| Gitea | `http://192.168.1.4:3001` |
| Git | `ssh://git@192.168.1.4:2222/meksteel/brasil_caramelo.git` |

---

## 16. Vídeo HLS (opcional)

Com `ffmpeg` no container (já incluso), após publicar vídeo o servidor pode gerar `playlist.m3u8`. Opcional no `.env`: `FFMPEG_PATH=/usr/bin/ffmpeg`.

Cron (com `CRON_SECRET` no `.env`):

```bash
# Trending apenas
curl -X POST http://127.0.0.1:3000/api/cron/trending -H "Authorization: Bearer SEU_CRON_SECRET"

# Manutenção completa (batalhas + stories + trending) — preferível
curl -X POST http://127.0.0.1:3000/api/cron/maintenance -H "x-cron-secret: SEU_CRON_SECRET"
```

---

## 18. Checklist produção v2.28+

Antes do deploy final, rode no servidor:

```bash
bash scripts/check-production-env.sh
bash scripts/setup-production-stack.sh   # dicas + passos opcionais
```

| Variável | Para quê |
|----------|----------|
| `PREMIUM_WEBHOOK_SECRET` | Webhook PIX automático (`POST /api/premium/webhook`) |
| `PEDIGREE_PIX_KEY` | Chave PIX exibida em `/premium` |
| `MERCADOPAGO_ACCESS_TOKEN` | Checkout Mercado Pago |
| `PREMIUM_ADMIN_USERNAMES` | Quem confirma PIX manual (`/premium` painel admin) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` | Push PWA — `./scripts/generate-vapid-keys.sh` |
| `MEILISEARCH_HOST` + `MEILISEARCH_MASTER_KEY` | Busca rápida — depois `./scripts/reindex-meilisearch.sh` |
| `S3_*` | MinIO — `docker compose up -d minio` + `./scripts/setup-minio-bucket.sh` |
| `REDIS_URL` | Cache e rate limit (`redis://host:6379`) |
| `OLLAMA_BASE_URL` | Cão de Guarda local (opcional) |
| `BC_SMOKE_EMAIL` + `BC_SMOKE_PASSWORD` | Smoke autenticado — `./scripts/setup-smoke-account.sh` |

**Alertas (cron na tailnet):**

```bash
# A cada 5 min (crontab -e)
*/5 * * * * curl -fsS https://SEU-HOST.ts.net/api/health >/dev/null || logger "BC health FAIL"
```

**Backup restore de prova:** extraia um `backup-matilha-*.tar.gz` em pasta temporária e valide `pg_restore --list` no dump SQL.

---

## 17. Histórico e Gitea

| Recurso | Onde |
|---------|------|
| Changelog | [Versions.txt](./Versions.txt) |
| Git self-hosted | [deploy/gitea/README.md](./deploy/gitea/README.md) — porta 3001, compose separado |
| Exemplos nginx | `deploy/nginx/` |
| Modelo `.env` | `.env.example` |

---

**Resumo:** um compose, um `.env`, cinco containers. Escolha o [modo de acesso](#5-escolher-modo-de-acesso), rode o script correspondente, `docker compose up -d --build`, valide com `bash scripts/server-audit.sh`.
