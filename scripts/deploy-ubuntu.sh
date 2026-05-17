#!/bin/bash
# Deploy no Ubuntu (ex.: 192.168.1.4)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Subindo PostgreSQL e app..."
docker compose up -d --build

echo "==> Aplicando migrações..."
docker compose exec app npx prisma migrate deploy

echo ""
echo "Pronto! Acesse: http://$(hostname -I | awk '{print $1}'):3000"
echo "Ou na rede local: http://192.168.1.4:3000"
