# Brasil Caramelo

Rede social brasileira **100% self-hosted** — um `docker-compose.yml` sobe tudo no seu Ubuntu.

## Subir no servidor

```bash
cd ~/brasil_caramelo
./scripts/deploy-brasil-caramelo.sh --mode tailscale   # recomendado no celular
# ou: ./scripts/deploy-ubuntu.sh
```

Ou: `cp .env.example .env` → `docker compose up -d --build`

## Stack (8 serviços Docker)

| Serviço | Porta |
|---------|-------|
| App (Next.js) | 3000 |
| PostgreSQL | 5432 |
| Soketi (tempo real) | 6001 |
| coturn (WebRTC) | 3478 |
| LiveKit (Latidos) | 7880 |
| Meilisearch | 7700 |
| Redis | 6379 (interno) |
| MinIO (mídia S3) | 9000 |

**Sem serviços externos** (OpenAI, Pusher cloud, etc.).

## Documentação

Tudo em um único guia: **[CONFIGURACAO.md](./CONFIGURACAO.md)** (deploy, `.env`, HTTPS, Tailscale, túnel, DNS, diagnóstico, testes).

Índice: [docs/README.md](./docs/README.md) · Changelog: [Versions.txt](./Versions.txt)

## Dev local (Windows)

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Para produção na LAN ou Tailscale, use Docker no Ubuntu — ver **CONFIGURACAO.md**.
