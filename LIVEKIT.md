# LiveKit — Latidos ao Vivo

Roda no container **livekit** do `docker-compose.yml` (porta **7880**).

## Configuração

Chaves em `deploy/livekit/livekit.yaml` e no `.env`:

```env
NEXT_PUBLIC_LIVEKIT_URL=ws://192.168.1.4:7880
LIVEKIT_API_KEY=caramelo_livekit_key
LIVEKIT_API_SECRET=caramelo_livekit_secret_change_me
```

- **`node_ip`** no yaml = mesmo IP que `BC_HOST` (ex. `192.168.1.4`)
- **`use_external_ip: false`** em LAN — não anunciar IP público via STUN

Use o IP/DNS da LAN (`BC_HOST`), não `localhost`.

## Celular

Microfone no celular **exige HTTPS**. Veja `CONFIGURACAO.md` § 4.1 e `deploy/nginx/brasilcaramelo-https.example.conf`.

## Subir / reiniciar

```bash
docker compose up -d --build
docker compose restart livekit   # após mudar livekit.yaml
```

## Rotas

- `/latidos` — lista de salas
- `/latidos/[slug]` — entrar na sala

Veja **CONFIGURACAO.md**.
