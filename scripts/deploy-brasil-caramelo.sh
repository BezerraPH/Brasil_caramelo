#!/bin/bash
# Deploy completo — Brasil Caramelo (stack Docker + migrações + modo de acesso opcional)
#
# Uso:
#   ./scripts/deploy-brasil-caramelo.sh                    # HTTP na LAN (padrão)
#   ./scripts/deploy-brasil-caramelo.sh --mode https       # mkcert + nginx (setup-https-lan.sh)
#   ./scripts/deploy-brasil-caramelo.sh --mode tailscale   # Tailscale Serve (setup-tailscale.sh --serve)
#   ./scripts/deploy-brasil-caramelo.sh --audit            # roda server-audit.sh ao final
#   ./scripts/deploy-brasil-caramelo.sh --smoke            # smoke tests após subir
#   ./scripts/deploy-brasil-caramelo.sh --full             # smoke + auditoria rápida
#   ./scripts/deploy-brasil-caramelo.sh --fresh-env        # recria .env (só se não existir, ou com --force-env)
#   ./scripts/deploy-brasil-caramelo.sh --force-env        # apaga .env e recria via setup-env.sh
#
# Alias legado: ./scripts/deploy-ubuntu.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="http"
RUN_AUDIT=0
RUN_SMOKE=0
FRESH_ENV=0
FORCE_ENV=0
SKIP_MIGRATE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --mode)
      MODE="${2:-http}"
      shift 2
      ;;
    --mode=*)
      MODE="${1#*=}"
      shift
      ;;
    --audit) RUN_AUDIT=1; shift ;;
    --smoke) RUN_SMOKE=1; shift ;;
    --full) RUN_SMOKE=1; RUN_AUDIT=1; shift ;;
    --fresh-env) FRESH_ENV=1; shift ;;
    --force-env) FORCE_ENV=1; FRESH_ENV=1; shift ;;
    --skip-migrate) SKIP_MIGRATE=1; shift ;;
    -h|--help)
      sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Argumento desconhecido: $1"
      exit 1
      ;;
  esac
done

case "$MODE" in
  http|https|tailscale) ;;
  *)
    echo "Modo inválido: $MODE (use http, https ou tailscale)"
    exit 1
    ;;
esac

echo "==> Brasil Caramelo — deploy (modo: $MODE)"

bc_ensure_cron_secret() {
  if grep -qE '^CRON_SECRET=.+' .env 2>/dev/null; then
    return 0
  fi
  if [ -x scripts/ensure-cron-secret.sh ]; then
    bash scripts/ensure-cron-secret.sh
  elif [ -f scripts/ensure-cron-secret.sh ]; then
    bash scripts/ensure-cron-secret.sh
  fi
}

if [ "$FORCE_ENV" -eq 1 ] && [ -f .env ]; then
  bak=".env.bak.$(date +%Y%m%d%H%M%S)"
  echo "==> Backup .env → $bak"
  cp .env "$bak"
  rm -f .env
fi

if [ ! -f .env ]; then
  echo "==> Criando .env..."
  bash scripts/setup-env.sh
elif [ "$FRESH_ENV" -eq 1 ]; then
  echo "==> .env já existe (use --force-env para recriar)"
fi

if [ -f .env ]; then
  bc_ensure_cron_secret
fi

if [ "$MODE" = "https" ]; then
  echo "==> Configurando HTTPS na LAN (mkcert + nginx)..."
  sudo bash scripts/setup-https-lan.sh
elif [ "$MODE" = "tailscale" ]; then
  echo "==> Configurando Tailscale Serve..."
  sudo bash scripts/setup-tailscale.sh --serve
fi

echo "==> Subindo stack (app, db, soketi, coturn, livekit)..."
docker compose up -d --build

echo "==> Recarregando LiveKit e coturn..."
docker compose restart livekit coturn 2>/dev/null || true

if [ "$SKIP_MIGRATE" -eq 0 ]; then
  echo "==> Aplicando migrações Prisma..."
  docker compose exec -T app npx prisma migrate deploy
fi

CRON_SECRET_VAL="$(grep -E '^CRON_SECRET=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
if [ -n "$CRON_SECRET_VAL" ]; then
  echo "==> Manutenção inicial (batalhas, stories, trending)..."
  sleep 2
  curl -fsS -X POST "http://127.0.0.1:${APP_PORT:-3000}/api/cron/maintenance" \
    -H "x-cron-secret: ${CRON_SECRET_VAL}" >/dev/null 2>&1 \
    && echo "    OK" \
    || echo "    [AVISO] Falhou — rode manualmente após o app subir"
fi

# URLs amigáveis
APP_URL="$(grep -E '^APP_URL=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
BC_HOST="$(grep -E '^BC_HOST=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
BC_HOST="${BC_HOST#https://}"
BC_HOST="${BC_HOST#http://}"
BC_HOST="${BC_HOST%%/*}"

echo ""
echo "Pronto! Brasil Caramelo self-hosted."
if [ -n "$APP_URL" ]; then
  echo "  App:     $APP_URL"
else
  echo "  App:     http://${BC_HOST:-$(hostname -I | awk '{print $1}')}:3000"
fi
echo "  Guia:    CONFIGURACAO.md"
echo "  Auditoria: bash scripts/server-audit.sh"
echo "  Smoke:     bash scripts/server-smoke.sh"

if ! grep -qE '^CRON_SECRET=.+' .env 2>/dev/null; then
  echo ""
  echo "  [AVISO] CRON_SECRET vazio — defina no .env para /api/cron/maintenance (ver CONFIGURACAO.md §14)"
fi

if [ "$MODE" = "http" ]; then
  echo ""
  echo "  Celular (microfone/Latidos): configure HTTPS — ver CONFIGURACAO.md §5"
  echo "    sudo bash scripts/setup-tailscale.sh --serve   # recomendado"
  echo "    sudo bash scripts/setup-https-lan.sh           # LAN + mkcert"
fi

if [ "$RUN_SMOKE" -eq 1 ]; then
  echo ""
  echo "==> Smoke tests..."
  sleep 3
  bash scripts/server-smoke.sh || {
    echo "Smoke falhou — verifique .env (BC_HOST, APP_URL) e logs: docker compose logs app --tail 40"
    exit 1
  }
fi

if [ "$RUN_AUDIT" -eq 1 ]; then
  echo ""
  echo "==> Auditoria..."
  bash scripts/server-audit.sh --quick
fi

if command -v git >/dev/null 2>&1 && [ -n "$(git status --porcelain scripts/ deploy/livekit/ 2>/dev/null)" ]; then
  echo ""
  echo "  [INFO] scripts/ ou livekit.yaml modificados localmente (normal após setup-tailscale)."
  echo "         Para alinhar ao Git: bash scripts/sync-from-git.sh"
fi
