#!/usr/bin/env bash
# Backup PostgreSQL + uploads do Brasil Caramelo (self-hosted).
# Uso no servidor: ./scripts/backup-matilha.sh [destino]
set -euo pipefail

DEST="${1:-$HOME/backups/brasil_caramelo}"
STAMP="$(date +%Y%m%d_%H%M%S)"
DIR="$DEST/$STAMP"
mkdir -p "$DIR"

echo "→ Backup em $DIR"

if docker compose ps db --status running -q 2>/dev/null | grep -q .; then
  docker compose exec -T db pg_dump -U caramelo brasil_caramelo | gzip > "$DIR/db.sql.gz"
  echo "  ✓ PostgreSQL"
else
  echo "  ⚠ Container db não está rodando — pulando dump"
fi

if [ -d "./data/uploads" ]; then
  tar -czf "$DIR/uploads.tar.gz" -C ./data uploads
  echo "  ✓ uploads/"
elif docker compose ps app --status running -q 2>/dev/null | grep -q .; then
  docker compose exec -T app tar -czf - -C /app/data uploads > "$DIR/uploads.tar.gz" 2>/dev/null || true
  echo "  ✓ uploads (via container app)"
fi

echo "Pronto. Mantenha cópias em outro disco ou via Tailscale."
