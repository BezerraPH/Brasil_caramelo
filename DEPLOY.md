# Deploy no Ubuntu (192.168.1.4)

## Pré-requisitos

- Docker e Docker Compose instalados no servidor
- Portas **3000** (app) e **5432** (Postgres, opcional externamente) liberadas no firewall

## Passos

1. Copie o projeto para o servidor (git clone, scp, etc.).

2. Na pasta do projeto:

```bash
cp .env.example .env
chmod +x scripts/deploy-ubuntu.sh
./scripts/deploy-ubuntu.sh
```

3. Acesse no navegador: `http://192.168.1.4:3000`

## Desenvolvimento local (Windows)

```bash
cp .env.example .env
docker compose up db -d
npm install
npx prisma generate
npm run db:deploy
npm run dev
```

> O build Docker usa `npm ci --ignore-scripts` porque o schema só existe após copiar os arquivos do projeto.

## Roadmap técnico

| Fase | Recursos |
|------|----------|
| **1 (atual)** | Modo Feed, perfis, reputação canina, recados |
| **2** | Jogo do cachorro (`Pet` no banco), customização diária |
| **3** | Chats e grupos (WebSocket + Redis) |
| **4** | Chamadas voz/vídeo e reuniões (WebRTC / LiveKit) |
| **5** | Modo Insta (grade) e Reels (vídeo curto) |

## Credenciais padrão do Docker

- Postgres: usuário `caramelo`, senha `caramelo_secret`, banco `brasil_caramelo`
- Altere em produção no `docker-compose.yml` e no `DATABASE_URL`.

## Git com interface (Gitea)

Seu servidor está adequado (Ubuntu 26.04, 14 GB RAM, Docker ok).

```bash
chmod +x scripts/setup-gitea.sh
./scripts/setup-gitea.sh
```

Depois acesse **http://192.168.1.4:3001** (ou **http://100.94.55.27:3001** via Tailscale).

Passo a passo completo (desktop → servidor): **`deploy/gitea/README.md`**
