# LiveKit — Latidos ao Vivo

Roda no container **livekit** do `docker-compose.yml` (porta **7880**).

## Configuração

Chaves em `deploy/livekit/livekit.yaml` e no `.env`:

```env
NEXT_PUBLIC_LIVEKIT_URL=ws://192.168.1.4:7880
LIVEKIT_API_KEY=caramelo_livekit_key
LIVEKIT_API_SECRET=caramelo_livekit_secret_change_me
```

Use o IP/DNS da LAN (`BC_HOST`), não `localhost`.

## Subir

Incluso no deploy padrão:

```bash
docker compose up -d --build
```

## Rotas

- `/latidos` — lista de salas
- `/latidos/[slug]` — entrar na sala

Veja **CONFIGURACAO.md**.
