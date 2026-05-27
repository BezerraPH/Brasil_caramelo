#!/bin/bash
# Gera par de chaves VAPID para push PWA — copie para .env
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v npx >/dev/null 2>&1; then
  echo "npx não encontrado"
  exit 1
fi

echo "Adicione ao .env:"
echo ""
npx --yes web-push generate-vapid-keys 2>/dev/null | sed 's/^Public Key/NEXT_PUBLIC_VAPID_PUBLIC_KEY/; s/^Private Key/VAPID_PRIVATE_KEY/'
echo "VAPID_SUBJECT=mailto:admin@brasilcaramelo.local"
