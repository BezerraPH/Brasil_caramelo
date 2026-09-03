#!/usr/bin/env bash
# Backup PostgreSQL + uploads (+ metadados) — R-OPS-04
# Uso: ./scripts/backup-matilha.sh [destino]
#      RETENTION_DAYS=14 ./scripts/backup-matilha.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEST="${1:-$HOME/backups/brasil_caramelo}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d_%H%M%S)"
DIR="$DEST/$STAMP"
mkdir -p "$DIR"

echo "→ Backup em $DIR"

if docker compose ps db --status running -q 2>/dev/null | grep -q .; then
  docker compose exec -T db pg_dump -U caramelo brasil_caramelo | gzip > "$DIR/db.sql.gz"
  echo "  ✓ PostgreSQL (db.sql.gz)"
else
  echo "  ⚠ Container db não está rodando — pulando dump"
fi

# Com MinIO (S3_* no .env), mídia fica no volume Docker minio_data — faça snapshot do volume no host.
if docker volume inspect brasil_caramelo_minio_data >/dev/null 2>&1; then
  echo "  ℹ Volume minio_data detectado — considere backup do volume Docker separadamente"
fi

if [ -d "./data/uploads" ]; then
  tar -czf "$DIR/uploads.tar.gz" -C ./data uploads
  echo "  ✓ uploads/"
elif docker compose ps app --status running -q 2>/dev/null | grep -q .; then
  docker compose exec -T app tar -czf - -C /app/data uploads > "$DIR/uploads.tar.gz" 2>/dev/null || true
  echo "  ✓ uploads (via container app)"
fi

{
  echo "stamp=$STAMP"
  echo "hostname=$(hostname 2>/dev/null || echo unknown)"
  grep -E '^APP_URL=|^BC_HOST=' .env 2>/dev/null || true
  docker compose ps 2>/dev/null || true
} > "$DIR/manifest.txt"
echo "  ✓ manifest.txt"

if [ -d "$DEST" ] && [ "$RETENTION_DAYS" -gt 0 ] 2>/dev/null; then
  find "$DEST" -maxdepth 1 -type d -name '20*' -mtime +"$RETENTION_DAYS" -exec rm -rf {} + 2>/dev/null || true
  echo "  ✓ retenção ${RETENTION_DAYS} dias aplicada em $DEST"
fi

echo "Pronto. Copie para outro disco ou Tailscale."
