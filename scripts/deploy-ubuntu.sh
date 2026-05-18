#!/bin/bash
# Deploy no Ubuntu (ex.: 192.168.1.4)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Subindo PostgreSQL e app..."
docker compose up -d --build

echo "==> Aplicando migrações..."
docker compose exec app npx prisma migrate deploy

echo ""
IP=$(hostname -I | awk '{print $1}')
echo "Pronto!"
echo "  IP:    http://${IP}:3000"
echo "  DNS:   http://brasilcaramelo.com:3000  (após configurar hosts/DNS — ver DNS-LOCAL.md)"
if grep -q '^APP_URL=' .env 2>/dev/null; then
  echo "  APP_URL no .env: $(grep '^APP_URL=' .env | cut -d= -f2- | tr -d '"')"
fi
