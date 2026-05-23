# Brasil Caramelo

Rede social brasileira **100% self-hosted** — um `docker-compose.yml` sobe tudo no seu Ubuntu.

## Subir no servidor

```bash
cd ~/brasil_caramelo
./scripts/deploy-ubuntu.sh
```

Ou: `cp .env.example .env` → `docker compose up -d --build`

## Stack (5 containers)

| Serviço | Porta |
|---------|-------|
| App (Next.js) | 3000 |
| PostgreSQL | 5432 |
| Soketi (tempo real) | 6001 |
| coturn (WebRTC) | 3478 |
| LiveKit (Latidos) | 7880 |

**Sem serviços externos** (OpenAI, Pusher cloud, etc.).

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| **[CONFIGURACAO.md](./CONFIGURACAO.md)** | Guia do `.env` |
| [DEPLOY.md](./DEPLOY.md) | Deploy Ubuntu |
| [deploy/README.md](./deploy/README.md) | Arquivos de infra |
| [DNS-LOCAL.md](./DNS-LOCAL.md) | DNS na LAN |
| [Versions.txt](./Versions.txt) | Histórico |

## Dev local (Windows)

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Para produção na LAN, use Docker no Ubuntu.
