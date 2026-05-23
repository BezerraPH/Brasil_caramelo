# LiveKit — Latidos ao Vivo

Salas de áudio por casinha usando [LiveKit](https://livekit.io/).

## Variáveis de ambiente

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://seu-projeto.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

- `NEXT_PUBLIC_LIVEKIT_URL` — URL WebSocket do servidor LiveKit (pública, usada no browser).
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` — credenciais do projeto (somente servidor).

## Opções de deploy

### LiveKit Cloud (recomendado para testes)

1. Crie conta em https://cloud.livekit.io/
2. Copie URL, API Key e Secret para o `.env`
3. Rebuild do app: `docker compose up -d --build`

### Self-hosted (LAN)

Consulte a documentação oficial para rodar o servidor LiveKit na mesma rede (192.168.1.4).
Use `wss://` com certificado ou `ws://` apenas em desenvolvimento local.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/latidos` | Lista de salas (10 casinhas) |
| `/latidos/[slug]` | Sala ao vivo (ex.: `/latidos/pitbull`) |
| `GET /api/livekit/token?room=slug` | Token JWT autenticado |

Nome interno da sala: `bc-latidos-{slug}` (ex.: `bc-latidos-caramelo`).

## Comportamento

- Microfone começa **mudo** ao entrar.
- Conquista **LATIDOS_FIRST** na primeira entrada.
- Sem LiveKit configurado, a UI mostra instruções e link para LIVEKIT.md.

## Docker Compose

Adicione ao `.env` na raiz do projeto e reinicie o container `app`:

```bash
docker compose up -d --build
```

As variáveis `LIVEKIT_*` são repassadas pelo `docker-compose.yml` (v2.3.7+).
