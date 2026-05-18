# Deploy no Ubuntu (rede local)

Servidor de referência: **192.168.1.4** (LAN) ou nome local **brasilcaramelo.com** — veja [DNS-LOCAL.md](./DNS-LOCAL.md).

## Pré-requisitos

- Docker e Docker Compose
- Portas **3000** (app) e, opcionalmente, **80** (nginx) liberadas

## Passos

1. Copie o projeto para o servidor.

2. Configure o ambiente:

```bash
cp .env.example .env
```

Edite `.env` — exemplo com DNS na LAN:

```env
APP_URL=http://brasilcaramelo.com:3000
NEXT_PUBLIC_APP_URL=http://brasilcaramelo.com:3000
COOKIE_SECURE=false
# Pusher, OPENAI_API_KEY, etc.
```

3. Deploy:

```bash
chmod +x scripts/deploy-ubuntu.sh
./scripts/deploy-ubuntu.sh
```

4. Acesse:

| Modo | URL |
|------|-----|
| IP | http://192.168.1.4:3000 |
| DNS local (hosts/roteador) | http://brasilcaramelo.com:3000 |
| nginx (porta 80) | http://brasilcaramelo.com |

## DNS local (`brasilcaramelo.com`)

Guia completo: **[DNS-LOCAL.md](./DNS-LOCAL.md)** — hosts no Windows, DNS no roteador, dnsmasq e nginx sem `:3000`.

## Desenvolvimento local (Windows)

```bash
cp .env.example .env
docker compose up db -d
npm install
npx prisma generate
npm run db:deploy
npm run dev
```

## Stack atual (v1.9)

| Área | Recursos |
|------|----------|
| Social | Feed, Insta, Cinelar, stories, casinhas, hashtags |
| Pet | Jogo, quintal, cosméticos, Pedigree |
| Chat | DM, salas, typing, anexos, WebRTC |
| Infra | Docker, upload local, Pusher opcional, DNS local |

## Credenciais Docker (padrão)

- Postgres: `caramelo` / `caramelo_secret` / `brasil_caramelo`
- Altere em produção no `docker-compose.yml`.

## Git (Gitea)

```bash
chmod +x scripts/setup-gitea.sh
./scripts/setup-gitea.sh
```

- LAN: http://192.168.1.4:3001  
- Tailscale: http://100.94.55.27:3001  

Detalhes: `deploy/gitea/README.md`
