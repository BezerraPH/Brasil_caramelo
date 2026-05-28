#!/bin/bash
# Audita .env de produção — variáveis opcionais mas recomendadas (onda v2.28).
# Uso: ./scripts/check-production-env.sh
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/server-common.sh
source "$ROOT/scripts/lib/server-common.sh"

bc_hr
printf '▶ Checklist produção — Brasil Caramelo\n'
bc_hr

OK=0
WARN=0
FAIL=0

check_set() {
  local key="$1" label="$2" required="${3:-0}"
  local raw
  raw="$(bc_safe_env_raw "$key")"
  if [ -n "$raw" ]; then
    printf '  [OK]   %-32s %s definido\n' "$label" "$key"
    OK=$((OK + 1))
  elif [ "$required" = "1" ]; then
    printf '  [FAIL] %-32s %s ausente (obrigatório)\n' "$label" "$key"
    FAIL=$((FAIL + 1))
  else
    printf '  [WARN] %-32s %s vazio — recurso limitado\n' "$label" "$key"
    WARN=$((WARN + 1))
  fi
}

check_set DATABASE_URL "PostgreSQL" 1
check_set APP_URL "URL pública (APP_URL)" 1
check_set NEXT_PUBLIC_APP_URL "URL pública (client)" 1
check_set CRON_SECRET "Cron / manutenção" 0
check_set PREMIUM_WEBHOOK_SECRET "Premium webhook" 0
check_set PEDIGREE_PIX_KEY "PIX Pedigree" 0
check_set MERCADOPAGO_ACCESS_TOKEN "Mercado Pago" 0
check_set NEXT_PUBLIC_VAPID_PUBLIC_KEY "Push VAPID (public)" 0
check_set VAPID_PRIVATE_KEY "Push VAPID (private)" 0
check_set MEILISEARCH_HOST "Meilisearch" 0
check_set MEILISEARCH_MASTER_KEY "Meilisearch key" 0
check_set S3_ENDPOINT "MinIO/S3" 0
check_set S3_BUCKET "S3 bucket" 0
check_set REDIS_URL "Redis cache" 0
check_set OLLAMA_BASE_URL "Ollama (IA local)" 0
check_set BC_SMOKE_EMAIL "Smoke autenticado" 0
check_set FEDERATION_EXPORT_SECRET "Federação export" 0

printf '\n── Resumo ──\n'
printf '  OK: %s  |  WARN: %s  |  FAIL: %s\n' "$OK" "$WARN" "$FAIL"
printf '\nGuia: CONFIGURACAO.md · ROADMAP.md (P0 v2.28)\n'

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
