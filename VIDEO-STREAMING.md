# Vídeo e Cinelar — streaming no servidor

## Entrega atual (v2.3)

- **Range requests** em `GET /api/media/...` — o player baixa por partes (melhor em 4G).
- **Cache** no Service Worker para `/api/media/` (stale-while-revalidate).
- **Prefetch** no feed: próxima imagem/vídeo (256 KB) via `use-feed-prefetch.ts`.

## HLS opcional (ffmpeg)

Se `ffmpeg` estiver no PATH ou `FFMPEG_PATH` apontar para o binário, após upload de vídeo o servidor tenta gerar:

```
{userId}/{uuid}_hls/playlist.m3u8
```

O post salva `videoHlsUrl` e o player usa HLS quando disponível.

### Ubuntu

```bash
sudo apt install ffmpeg
# opcional no .env:
FFMPEG_PATH=/usr/bin/ffmpeg
```

Transcodificação é **síncrona no upload** (alpha). Para produção, use fila (Redis/worker).

## Cron de trending

```bash
curl -X POST http://localhost:3000/api/cron/trending \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

Configure `CRON_SECRET` e agende no servidor (systemd timer ou cron a cada hora).

## Federação LAN

Veja `FederationPanel` em `/configuracoes`. Use o mesmo `FEDERATION_EXPORT_SECRET` em todos os peers.
