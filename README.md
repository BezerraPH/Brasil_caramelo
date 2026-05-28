# Brasil Caramelo

Rede social brasileira **100% self-hosted** (Next.js + PostgreSQL) — sobe com **um** `docker-compose.yml` no seu Ubuntu.

- **Sem SaaS obrigatório**: roda tudo local (você decide se usa OpenAI/Ollama/MP).
- **Acesso fácil no celular**: recomendado via **Tailscale (HTTPS)**.
- **Mídia**: upload de imagens e vídeos; transcode HLS (opcional) com `ffmpeg`.

> Documentação e operação do servidor: **[CONFIGURACAO.md](./CONFIGURACAO.md)**.

---

## Começar rápido (Servidor Ubuntu)

```bash
cd ~/brasil_caramelo
bash scripts/sync-from-git.sh
sudo bash scripts/deploy-brasil-caramelo.sh --mode tailscale --full
```

Alternativa minimalista:

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec -T app npx prisma migrate deploy
```

### Testes (smoke / diagnóstico)

```bash
bash scripts/server-smoke.sh
```

Smoke autenticado (recomendado):

```bash
bash scripts/setup-smoke-account.sh
bash scripts/server-smoke.sh
```

---

## Stack (8 serviços Docker)

| Serviço | Porta | Para quê |
|---------|------:|----------|
| App (Next.js) | 3000 | UI + API |
| PostgreSQL | 5432 | Banco |
| Soketi | 6001 | Tempo real (WebSocket) |
| coturn | 3478 | TURN/STUN (WebRTC em mensagens) |
| LiveKit | 7880 | Latidos (voz) |
| Meilisearch | 7700 | Busca |
| Redis | 6379 | Cache + rate limit |
| MinIO | 9000 | Mídia S3 (opcional, quando `S3_*` no `.env`) |

---

## Documentação

- **Guia único do servidor**: `CONFIGURACAO.md`
- **Índice de docs**: `docs/README.md`
- **Estrutura do projeto**: `docs/ESTRUTURA.md`
- **Scripts**: `scripts/README.md`
- **Changelog / roadmap resumido**: `Versions.txt`
- **Backlog (fonte única)**: `ROADMAP.md`

---

## Dev local (Windows)

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Para produção (LAN/Tailscale), use Docker no Ubuntu — veja `CONFIGURACAO.md`.
