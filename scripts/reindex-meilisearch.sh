#!/bin/bash
# Reindexa usuários e recados no Meilisearch (requer CRON_SECRET no .env)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

SECRET="${CRON_SECRET:-}"
URL="${APP_URL:-http://127.0.0.1:3000}"

if [ -z "$SECRET" ]; then
  echo "Defina CRON_SECRET no .env"
  exit 1
fi

curl -sf -X POST "${URL}/api/search/reindex" \
  -H "Authorization: Bearer ${SECRET}" \
  -H "Content-Type: application/json"

echo ""
echo "Reindex concluído."
