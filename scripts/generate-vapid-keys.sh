#!/bin/bash
# Gera par de chaves VAPID para push PWA — copie para .env
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

run_generate() {
  npx --yes web-push generate-vapid-keys 2>/dev/null | sed \
    's/^Public Key/NEXT_PUBLIC_VAPID_PUBLIC_KEY/; s/^Private Key/VAPID_PRIVATE_KEY/'
}

echo "Adicione ao .env:"
echo ""

if command -v npx >/dev/null 2>&1; then
  run_generate
elif command -v docker >/dev/null 2>&1 && docker compose ps --status running app 2>/dev/null | grep -q .; then
  docker compose exec -T app npx --yes web-push generate-vapid-keys 2>/dev/null | sed \
    's/^Public Key/NEXT_PUBLIC_VAPID_PUBLIC_KEY/; s/^Private Key/VAPID_PRIVATE_KEY/'
elif command -v docker >/dev/null 2>&1; then
  echo "Subindo app temporariamente para gerar VAPID…"
  docker compose run --rm --no-deps app npx --yes web-push generate-vapid-keys 2>/dev/null | sed \
    's/^Public Key/NEXT_PUBLIC_VAPID_PUBLIC_KEY/; s/^Private Key/VAPID_PRIVATE_KEY/'
else
  echo "ERRO: instale Node/npx no host OU rode com Docker:"
  echo "  docker compose run --rm --no-deps app npx --yes web-push generate-vapid-keys"
  exit 1
fi

echo "VAPID_SUBJECT=mailto:admin@brasilcaramelo.local"
