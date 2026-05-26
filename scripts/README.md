# Scripts — Brasil Caramelo

Índice dos scripts de deploy, configuração e diagnóstico do servidor.

| Script | Função |
|--------|--------|
| **deploy-brasil-caramelo.sh** | Deploy completo (`--mode`, `--audit`, `--smoke`, `--full`) |
| deploy-ubuntu.sh | Alias → `deploy-brasil-caramelo.sh` |
| setup-env.sh | Cria `.env` com IP detectado |
| setup-https-lan.sh | HTTPS mkcert na LAN (`brasilcaramelo.com`) |
| setup-tailscale.sh | Tailscale + `tailscale serve` (recomendado no celular) |
| setup-cloudflare-tunnel.sh | Túnel Cloudflare (público, WebRTC limitado) |
| server-audit.sh | Auditoria completa + smoke tests |
| server-smoke.sh | Smoke tests HTTP (listas em `smoke-tests*.list`) |
| server-report.sh | Alias → `server-audit.sh` |
| setup-smoke-account.sh | Conta de teste para smoke autenticado |
| backup-matilha.sh | Backup PostgreSQL + uploads |
| cron-maintenance.example | Cron horário → `/api/cron/maintenance` |
| ensure-cron-secret.sh | Gera `CRON_SECRET` no `.env` se vazio |
| sync-from-git.sh | `git pull` + reset de `scripts/` e `livekit.yaml` locais |
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
