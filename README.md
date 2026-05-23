# Brasil Caramelo

Rede social brasileira em **alpha** — feed, Insta, Cinelar, stories, casinhas, chat, WebRTC e jogo do pet.

**Versão:** ver `package.json` e badge no app (`v2.3.5-alpha`).

## Requisitos

- Node.js 20+
- PostgreSQL 16
- (Opcional) ffmpeg, coturn, Pusher, OpenAI (moderação de imagens)

## Desenvolvimento local

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Produção (Docker)

```bash
npx prisma migrate deploy
docker compose up -d --build
```

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `Versions.txt` | Histórico completo e funcionalidades |
| `DEPLOY.md` | Deploy no servidor |
| `DNS-LOCAL.md` | DNS `brasilcaramelo.com` na LAN |
| `COTURN.md` | WebRTC / TURN |
| `VIDEO-STREAMING.md` | HLS, hls.js, Range, cron trending |

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint
- `npm run db:migrate` — migrações (dev)
- `npm run db:deploy` — migrações (prod)

## Stack

Next.js 16 · React 19 · Prisma 7 · PostgreSQL · Tailwind 4 · hls.js · Pusher (opcional)
