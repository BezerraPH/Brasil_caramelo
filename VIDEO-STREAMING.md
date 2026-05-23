# Vídeo e Cinelar — streaming no servidor

## Entrega atual (v2.3.5)

- **Range requests** em `GET /api/media/...` — o player baixa por partes (melhor em 4G).
- **Cache** no Service Worker para `/api/media/` (stale-while-revalidate).
- **Prefetch** no feed e Cinelar (256 KB) via hooks de prefetch.
- **hls.js** no cliente (`BcVideo`) — playlists `.m3u8` funcionam no Chrome/Firefox; Safari usa HLS nativo.
- **Transcodificação async** após publicar (`schedulePostVideoTranscode`) + polling em `CreatePostForm`.

## HLS opcional (ffmpeg)

Se `ffmpeg` estiver no PATH ou `FFMPEG_PATH` apontar para o binário, após publicar um vídeo o servidor gera em background:

```
{userId}/{uuid}_hls/playlist.m3u8
```

O post salva `videoHlsUrl` e o `BcVideo` usa HLS quando disponível.

### Ubuntu

```bash
sudo apt install ffmpeg
# opcional no .env:
FFMPEG_PATH=/usr/bin/ffmpeg
```

Status do job: `GET /api/posts/[id]/video` → `{ hlsReady, videoHlsUrl }`.

## Cron de trending

```bash
curl -X POST http://localhost:3000/api/cron/trending \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

Configure `CRON_SECRET` e agende no servidor (systemd timer ou cron a cada hora).

## Federação LAN

Veja `FederationPanel` em `/configuracoes` ou o botão em `/explorar`. Use o mesmo `FEDERATION_EXPORT_SECRET` em todos os peers.
