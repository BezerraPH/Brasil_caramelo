#!/bin/bash
# Gera CRON_SECRET no .env se estiver vazio (cron maintenance + trending).
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Arquivo .env não encontrado. Rode: bash scripts/setup-env.sh"
  exit 1
fi

if grep -qE '^CRON_SECRET=.+' .env 2>/dev/null; then
  echo "CRON_SECRET já definido."
  exit 0
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl não encontrado. Defina manualmente no .env:"
  echo "  CRON_SECRET=$(head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  exit 1
fi

SECRET="$(openssl rand -hex 24)"
if grep -q '^CRON_SECRET=' .env; then
  if sed --version >/dev/null 2>&1; then
    sed -i "s/^CRON_SECRET=.*/CRON_SECRET=$SECRET/" .env
  else
    sed -i '' "s/^CRON_SECRET=.*/CRON_SECRET=$SECRET/" .env
  fi
else
  printf '\nCRON_SECRET=%s\n' "$SECRET" >> .env
fi

echo "CRON_SECRET gerado e salvo em .env"
echo "Agende: scripts/cron-maintenance.example"
