#!/bin/bash
# Instala linha de cron para backup diário (3h) — execute no servidor uma vez.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LINE="0 3 * * * cd $ROOT && RETENTION_DAYS=14 ./scripts/backup-matilha.sh >> /var/log/bc-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v 'backup-matilha.sh'; echo "$LINE") | crontab -
echo "Cron instalado: backup diário às 3h"
echo "Log: /var/log/bc-backup.log"
echo "Exemplo manual: ./scripts/backup-matilha.sh"
