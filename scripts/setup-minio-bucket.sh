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

echo "MinIO: $ENDPOINT · bucket=$BUCKET"
echo "O app cria o bucket na primeira gravação se não existir."
echo "Console web: ${ENDPOINT%:9000}:9001 (usuário=$KEY)"

if command -v curl >/dev/null 2>&1; then
  code="$(curl -s -o /dev/null -w '%{http_code}' "$ENDPOINT/minio/health/live" || echo 000)"
  if [ "$code" = "200" ]; then
    echo "✓ MinIO respondeu (health live)"
  else
    echo "[AVISO] MinIO não respondeu em $ENDPOINT (HTTP $code)"
  fi
fi
