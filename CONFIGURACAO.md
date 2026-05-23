# Configuração — self-hosted (um compose, um .env)

O Brasil Caramelo roda **inteiro no seu Ubuntu**. Um arquivo `docker-compose.yml` sobe **app + banco + Soketi + coturn + LiveKit**.

---

## Início rápido (servidor)

```bash
cd ~/brasil_caramelo
git pull

# Cria .env com o IP detectado (ex.: 192.168.1.4)
chmod +x scripts/setup-env.sh scripts/deploy-ubuntu.sh
./scripts/setup-env.sh

# Ou manual: cp .env.example .env && nano .env

docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Atalho: `./scripts/deploy-ubuntu.sh` (faz tudo acima).

Acesse: **http://192.168.1.4:3000** (troque pelo seu IP).

### Diagnóstico e smoke tests

Conta dedicada + testes automáticos (sem expor senhas no Git):

```bash
chmod +x scripts/*.sh
./scripts/setup-smoke-account.sh   # cria smoke_test no site (LAN)
./scripts/server-smoke.sh            # testes HTTP (sem login + com login)
./scripts/server-report.sh           # relatório completo para colar no chat
```

Variáveis opcionais no `.env`: `BC_SMOKE_EMAIL`, `BC_SMOKE_PASSWORD`, `BC_SMOKE_USERNAME`.

---

## Onde fica cada coisa

```
brasil_caramelo/
  docker-compose.yml    ← stack completa (NÃO use outro compose)
  .env                  ← você cria a partir de .env.example
  .env.example          ← modelo com valores padrão
  CONFIGURACAO.md       ← este guia
  deploy/
    livekit/livekit.yaml
    nginx/              ← opcional
    gitea/              ← Git opcional (compose separado)
  scripts/
    setup-env.sh        ← gera .env com seu IP
    deploy-ubuntu.sh    ← deploy completo
```

---

## Variável principal: `BC_HOST`

É o **IP ou nome DNS** que celular e PC usam para chegar ao servidor.

```env
BC_HOST=192.168.1.4
```

Depois de mudar `BC_HOST` ou qualquer `NEXT_PUBLIC_*`:

```bash
docker compose up -d --build
```

O script `setup-env.sh` preenche `BC_HOST` e substitui `192.168.1.4` no resto do `.env`.

---

## O que cada serviço faz

| Container | Porta | Precisa configurar? |
|-----------|-------|---------------------|
| **app** | 3000 | `APP_URL` / `NEXT_PUBLIC_APP_URL` |
| **db** | 5432 | Já vem no compose (senha padrão) |
| **soketi** | 6001 | Credenciais padrão no `.env.example` |
| **coturn** | 3478 | Usuário/senha TURN no `.env` |
| **livekit** | 7880 | Chaves em `.env` + `deploy/livekit/livekit.yaml` |

**Sem `.env`:** o compose usa defaults com `BC_HOST=192.168.1.4`. Funciona se esse for seu IP.

---

## `.env` — seções

### 1. App (obrigatório)

| Variável | Valor típico |
|----------|--------------|
| `BC_HOST` | `192.168.1.4` |
| `APP_URL` | `http://192.168.1.4:3000` |
| `NEXT_PUBLIC_APP_URL` | igual ao `APP_URL` |
| `COOKIE_SECURE` | `false` (HTTP na LAN) |
| `DATABASE_URL` | já correto para Docker (`@db:5432`) |

### 2. Soketi (tempo real)

| Variável | Valor |
|----------|-------|
| `PUSHER_HOST` | `soketi` (nome Docker — **não mude**) |
| `NEXT_PUBLIC_PUSHER_HOST` | `192.168.1.4` (IP do **celular/PC**) |
| `PUSHER_KEY` / `NEXT_PUBLIC_PUSHER_KEY` | `caramelo_key_local` |

**Erro comum:** `NEXT_PUBLIC_PUSHER_HOST=localhost` — não funciona no celular.

### 3. coturn (vídeo em /mensagens)

```env
NEXT_PUBLIC_STUN_URL=stun:192.168.1.4:3478
NEXT_PUBLIC_TURN_URL=turn:192.168.1.4:3478
NEXT_PUBLIC_TURN_USERNAME=caramelo
NEXT_PUBLIC_TURN_CREDENTIAL=caramelo_turn_secret
```

### 4. LiveKit (Latidos em /latidos)

```env
NEXT_PUBLIC_LIVEKIT_URL=ws://192.168.1.4:7880
LIVEKIT_API_KEY=caramelo_livekit_key
LIVEKIT_API_SECRET=caramelo_livekit_secret_change_me
```

Altere o secret em `deploy/livekit/livekit.yaml` também.

### 5. Opcional

| Variável | Uso |
|----------|-----|
| `PREMIUM_CODE` | Código Pedigree |
| `NEXT_PUBLIC_PET_SHOP_REGION` | `Recife` ou `Caruaru` |
| `EVENT_ADMIN_SECRET` | Criar rolezinho flash |
| `FFMPEG_PATH` | `/usr/bin/ffmpeg` (já no container) |

### 6. Deixe vazio

`OPENAI_API_KEY` — app usa moderação e Guarda **locais**.

---

## DNS local (opcional)

Se usar `brasilcaramelo.com`, veja **DNS-LOCAL.md** e ajuste:

```env
BC_HOST=brasilcaramelo.com
APP_URL=http://brasilcaramelo.com:3000
NEXT_PUBLIC_APP_URL=http://brasilcaramelo.com:3000
NEXT_PUBLIC_PUSHER_HOST=brasilcaramelo.com
NEXT_PUBLIC_STUN_URL=stun:brasilcaramelo.com:3478
NEXT_PUBLIC_TURN_URL=turn:brasilcaramelo.com:3478
NEXT_PUBLIC_LIVEKIT_URL=ws://brasilcaramelo.com:7880
```

Rebuild após mudar.

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Login não persiste | `COOKIE_SECURE=false` |
| Chat sem tempo real | Verifique se `soketi` está up: `docker compose ps` |
| Latidos não conecta | `livekit` up + `NEXT_PUBLIC_LIVEKIT_URL` com IP LAN |
| Mud（ídeo falha fora da Wi‑Fi | coturn up + vars TURN |
| Mudou `.env` e nada mudou | `docker compose up -d --build` |

---

## Comandos úteis

```bash
docker compose ps              # status dos 5 serviços
docker compose logs app        # logs do site
docker compose logs soketi
docker compose restart app
docker compose down            # parar tudo
```

---

## Ollama (IA local — opcional)

Com [Ollama](https://ollama.com) no servidor ou em outra máquina da LAN:

```bash
ollama pull llama3.2
ollama pull moondream   # visão para moderação de imagens
```

No `.env`:

```env
OLLAMA_BASE_URL=http://192.168.1.4:11434
OLLAMA_MODEL=llama3.2
OLLAMA_VISION_MODEL=moondream
```

- **Cão de Guarda** (`/configuracoes`) usa Ollama antes de OpenAI.
- **Upload de imagens** passa pelo modelo de visão se configurado.

---

## Backup

```bash
chmod +x scripts/backup-matilha.sh
./scripts/backup-matilha.sh
```

Agendamento: veja `scripts/cron-backup.example`.

---

## Resumo

**Um compose. Um `.env`. Cinco containers.** Nada de Pusher cloud, OpenAI ou LiveKit cloud.

Mais detalhes: `deploy/README.md`, `DEPLOY.md`, `LIVEKIT.md`, `COTURN.md`.
