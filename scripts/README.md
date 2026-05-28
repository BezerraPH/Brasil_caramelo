# Scripts — Brasil Caramelo

Índice dos scripts de deploy, configuração e diagnóstico do servidor.

| Script | Função |
|--------|--------|
| **deploy-brasil-caramelo.sh** | Deploy completo (`--mode`, `--audit`, `--smoke`, `--full`) |
| **check-production-env.sh** | Audita `.env` (Premium, VAPID, Meili, S3, Redis…) |
| **setup-production-stack.sh** | Passos opcionais pós-deploy (v2.28+ P0) |
| deploy-ubuntu.sh | Alias → `deploy-brasil-caramelo.sh` |
| setup-env.sh | Cria `.env` com IP detectado |
| setup-https-lan.sh | HTTPS mkcert na LAN (`brasilcaramelo.com`) |
| setup-tailscale.sh | Tailscale + `tailscale serve` (recomendado no celular) |
| setup-cloudflare-tunnel.sh | Túnel Cloudflare (público, WebRTC limitado) |
| server-audit.sh | Auditoria completa + smoke tests |
| server-smoke.sh | Smoke tests HTTP (listas em `smoke-tests*.list`) |
| server-report.sh | Alias → `server-audit.sh` |
| setup-smoke-account.sh | Conta de teste para smoke autenticado |
| backup-matilha.sh | Backup PostgreSQL + uploads (retenção RETENTION_DAYS) |
| setup-backup-cron.sh | Instala cron diário 3h para backup |
| setup-minio-bucket.sh | Checa saúde do MinIO e bucket bc-media |
| setup-federation-tailscale.sh | FEDERATION_EXPORT_SECRET + checklist Tailscale |
| setup-capacitor.sh | Inicializa Capacitor Android (URL do servidor) |
| validate-smoke-tests.sh | Valida formato de smoke-tests.list (CI) |
| cron-maintenance.example | Cron horário → `/api/cron/maintenance` |
| ensure-cron-secret.sh | Gera `CRON_SECRET` no `.env` se vazio |
| sync-from-git.sh | `git pull` + reset de `scripts/` e `livekit.yaml` locais |
| fix-nginx-tailscale.sh | Corrige nginx :8780 + `tailscale serve` se deploy falhar |
| reindex-meilisearch.sh | Reindexa busca Meilisearch (`CRON_SECRET`) |
| generate-vapid-keys.sh | Gera chaves VAPID para push PWA |
| cron-backup.example | Cron diário de backup |
| setup-gitea.sh | Gitea local (opcional) |
| hosts-snippet.txt | Linha para `/etc/hosts` manual |
| lib/server-common.sh | Funções compartilhadas (não executar direto) |

## Deploy rápido

```bash
chmod +x scripts/*.sh
./scripts/deploy-brasil-caramelo.sh --mode tailscale --audit
```

Ver **CONFIGURACAO.md** para modos de acesso e troubleshooting.

Após atualizar para **v2.23+**, no servidor:

```bash
docker compose exec -T app npx prisma migrate deploy
```

Configure no `.env` (ver CONFIGURACAO.md § 3.5): `PEDIGREE_PIX_KEY`, `PREMIUM_WEBHOOK_SECRET`, opcional `MERCADOPAGO_ACCESS_TOKEN`.

Configure Meilisearch + VAPID no `.env` (§ 3.8–3.9 em CONFIGURACAO.md). Depois:

```bash
./scripts/reindex-meilisearch.sh
```

Após atualizar para **v2.27+** (fim do roadmap V3):

```bash
docker compose exec -T app npx prisma migrate deploy
./scripts/setup-federation-tailscale.sh   # opcional — peers Tailscale
```

Smoke (v2.27): `POST /api/federation/peers/probe-test/probe` (401).

Após atualizar para **v2.29+**:

```bash
docker compose exec -T app npx prisma migrate deploy
```

Smoke (v2.29): comunidades mural/fórum/hot, `GET /api/premium/orders/admin` (403 se não admin).

Configure `PREMIUM_ADMIN_USERNAMES=seu_user` para painel PIX em `/premium`.

Template `.env` completo (Tailscale ntek-servidor):

```bash
cp deploy/env/ntek-servidor.env.example .env
nano .env
bash scripts/generate-vapid-keys.sh
docker compose up -d --build
bash scripts/setup-minio-bucket.sh
bash scripts/reindex-meilisearch.sh
```

Após atualizar para **v2.26+**:

```bash
docker compose exec -T app npx prisma migrate deploy
```

Smoke (v2.26): `GET /api/communities`, `GET /comunidades`, `GET /api/users/me/export` (401).

Após atualizar para **v2.25+** (MinIO opcional):

```bash
# Descomente S3_* no .env ou use defaults do docker-compose
docker compose up -d minio
./scripts/setup-minio-bucket.sh
```

Smoke (v2.25): `GET /api/storage/stats` (401 sem login).

Após atualizar para **v2.24+**:

```bash
# Redis sobe com docker compose; opcional no .env: REDIS_URL=redis://redis:6379
./scripts/setup-backup-cron.sh   # uma vez no servidor
npm run validate:smoke           # local ou no CI
```

Smoke tests (v2.24): `GET /api/ops/metrics`, `POST /api/ops/event` (401 sem CRON).

Smoke tests novos (v2.23): `/api/search/status`, `/api/search/reindex`, `/api/push/vapid`.

Smoke tests (v2.22): `GET /pet-shops`, `GET /api/pet-shop/partners`.

Smoke tests (v2.21): `POST /api/premium/orders`, webhooks premium, `GET /api/livekit/token?room=matilha:…`, `GET /latidos/m/{slug}`.

Smoke tests (v2.19): `/api/posts/cinelar`, `/api/packs/{slug}/polls-feed`, `/api/posts/{id}/reels-view`.
