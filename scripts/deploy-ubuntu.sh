#!/bin/bash
# Deploy completo self-hosted — Ubuntu (192.168.1.4)
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "==> Criando .env a partir do exemplo..."
  bash scripts/setup-env.sh
fi

echo "==> Subindo stack completa (app, db, soketi, coturn, livekit)..."
docker compose up -d --build

echo "==> Aplicando migrações..."
docker compose exec app npx prisma migrate deploy

echo ""
IP=$(grep '^BC_HOST=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || hostname -I | awk '{print $1}')
echo "Pronto! Brasil Caramelo self-hosted:"
echo "  App:     http://${IP}:3000"
echo "  Soketi:  ws://${IP}:6001  (chat ao vivo)"
echo "  LiveKit: ws://${IP}:7880  (Latidos ao Vivo)"
echo "  TURN:    turn:${IP}:3478  (chamadas vídeo)"
echo ""
echo "Guia: CONFIGURACAO.md"
echo "Backup: ./scripts/backup-matilha.sh (ver scripts/cron-backup.example)"
