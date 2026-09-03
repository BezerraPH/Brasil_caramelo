#!/bin/bash
# Guia interativo pós-deploy — ativa opcionais do .env (v2.28+ P0).
# Uso: ./scripts/setup-production-stack.sh
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Checklist .env"
bash scripts/check-production-env.sh || true

echo ""
echo "==> Passos opcionais (rode o que precisar):"

if ! grep -qE '^NEXT_PUBLIC_VAPID_PUBLIC_KEY=.+' .env 2>/dev/null; then
  echo "  [ ] Push PWA: ./scripts/generate-vapid-keys.sh  (copie para .env)"
fi

if ! grep -qE '^MEILISEARCH_HOST=.+' .env 2>/dev/null; then
  echo "  [ ] Meilisearch: descomente MEILISEARCH_* no .env, docker compose up -d meilisearch"
else
  echo "  [ ] Meilisearch: ./scripts/reindex-meilisearch.sh"
fi

if grep -qE '^S3_ENDPOINT=.+' .env 2>/dev/null; then
  echo "  [ ] MinIO: docker compose up -d minio && ./scripts/setup-minio-bucket.sh"
fi

if ! grep -qE '^BC_SMOKE_EMAIL=.+' .env 2>/dev/null; then
  echo "  [ ] Smoke: ./scripts/setup-smoke-account.sh"
fi

if ! grep -qE '^PREMIUM_ADMIN_USERNAMES=.+' .env 2>/dev/null; then
  echo "  [ ] Pedigree admin: PREMIUM_ADMIN_USERNAMES=seu_user no .env"
fi

echo ""
echo "Detalhes: CONFIGURACAO.md § 18"
