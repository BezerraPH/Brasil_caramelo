#!/bin/bash
# Verifica bucket MinIO (criado automaticamente pelo app na 1ª gravação).
# Uso: ./scripts/setup-minio-bucket.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

ENDPOINT="${S3_ENDPOINT:-http://127.0.0.1:9000}"
BUCKET="${S3_BUCKET:-bc-media}"
KEY="${S3_ACCESS_KEY:-caramelo_minio}"
SECRET="${S3_SECRET_KEY:-caramelo_minio_secret_change_me}"

# No host, hostname "minio" só existe na rede Docker — console/health em 127.0.0.1
PROBE="$ENDPOINT"
case "$PROBE" in
  http://minio:*|https://minio:*)
    PROBE="http://127.0.0.1:${PROBE##*:}"
    ;;
esac
CONSOLE="${PROBE%:9000}:9001"

echo "MinIO (app): $ENDPOINT · bucket=$BUCKET"
echo "MinIO (host): $PROBE · console=$CONSOLE (usuário=$KEY)"
echo "O app cria o bucket na primeira gravação se não existir."

if command -v curl >/dev/null 2>&1; then
  code="$(curl -s -o /dev/null -w '%{http_code}' "$PROBE/minio/health/live" 2>/dev/null || echo 000)"
  if [ "$code" = "200" ]; then
    echo "✓ MinIO respondeu (health live)"
    exit 0
  fi
  if command -v docker >/dev/null 2>&1 && docker compose ps --status running minio 2>/dev/null | grep -q .; then
    code="$(docker compose exec -T minio curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9000/minio/health/live 2>/dev/null || echo 000)"
    if [ "$code" = "200" ]; then
      echo "✓ MinIO OK (container em execução; app usa $ENDPOINT)"
      exit 0
    fi
  fi
  echo "[AVISO] MinIO não respondeu em $PROBE (HTTP $code) — rode: docker compose up -d minio"
  exit 0
fi
