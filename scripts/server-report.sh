#!/bin/bash
# Relatório operacional do servidor — sem segredos.
# Uso: ./scripts/server-report.sh
#      ./scripts/server-report.sh > relatorio-servidor.txt
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

hr() { printf '\n%s\n' "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }
section() { hr; printf '▶ %s\n' "$1"; hr; }

safe_env() {
  local key="$1"
  if [ -f .env ]; then
    local val
    val="$(grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
    if [ -z "$val" ]; then
      echo "(vazio ou ausente)"
    else
      echo "$val"
    fi
  else
    echo "(sem .env)"
  fi
}

run() {
  printf '$ %s\n' "$*"
  if "$@" 2>&1; then
    :
  else
    printf '(exit %s)\n' "$?"
  fi
}

BC_HOST="$(safe_env BC_HOST)"
[ "$BC_HOST" = "(vazio ou ausente)" ] || [ "$BC_HOST" = "(sem .env)" ] && BC_HOST="192.168.1.4"
APP_PORT="${APP_PORT:-3000}"
BASE="http://${BC_HOST}:${APP_PORT}"

printf 'BRASIL CARAMELO — RELATÓRIO DO SERVIDOR\n'
printf 'Gerado em: %s\n' "$(date -Iseconds 2>/dev/null || date)"
printf 'Diretório: %s\n' "$ROOT"

section "1. Sistema"
run hostname
run uname -a
if [ -f /etc/os-release ]; then
  run bash -c 'grep PRETTY /etc/os-release | cut -d= -f2 | tr -d "\""'
fi
run whoami
run pwd
run df -h /
run free -h 2>/dev/null || true

section "2. Git"
if command -v git >/dev/null 2>&1; then
  run git remote -v
  run git branch --show-current
  run git log -1 --oneline
  run git status -sb
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    printf '\nArquivos modificados localmente:\n'
    git status --porcelain
    printf '\nDiff resumido (primeiras 40 linhas):\n'
    git diff --stat 2>/dev/null | head -40
  else
    printf '\nWorking tree limpo (sem alterações locais).\n'
  fi
else
  echo "git não instalado"
fi

section "3. .env (somente valores não sensíveis)"
printf 'BC_HOST=%s\n' "$(safe_env BC_HOST)"
printf 'APP_URL=%s\n' "$(safe_env APP_URL)"
printf 'NEXT_PUBLIC_APP_URL=%s\n' "$(safe_env NEXT_PUBLIC_APP_URL)"
printf 'COOKIE_SECURE=%s\n' "$(safe_env COOKIE_SECURE)"
printf 'UPLOAD_DIR=%s\n' "$(safe_env UPLOAD_DIR)"
printf 'OLLAMA_BASE_URL=%s\n' "$(safe_env OLLAMA_BASE_URL)"
printf 'OLLAMA_MODEL=%s\n' "$(safe_env OLLAMA_MODEL)"
printf 'OPENAI_API_KEY configurada: '
if [ -f .env ] && grep -qE '^OPENAI_API_KEY=.+' .env 2>/dev/null; then echo sim; else echo não; fi
printf 'CRON_SECRET configurado: '
if [ -f .env ] && grep -qE '^CRON_SECRET=.+' .env 2>/dev/null; then echo sim; else echo não; fi

section "4. Docker"
if command -v docker >/dev/null 2>&1; then
  run docker --version
  run docker compose version
  run docker compose ps -a
  printf '\nImagens do projeto:\n'
  docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' 2>/dev/null \
    | grep -E 'brasil_caramelo|REPOSITORY' || true
else
  echo "docker não instalado"
fi

section "5. App — versão e saúde"
run curl -sS -m 10 "${BASE}/api/version"
printf '\n'
run curl -sS -m 10 "${BASE}/api/health"
printf '\n'

section "6. Prisma / banco"
if command -v docker >/dev/null 2>&1 && docker compose ps app 2>/dev/null | grep -q Up; then
  run docker compose exec -T app npx prisma migrate status
else
  echo "Container app não está Up — pulando migrate status"
fi

section "7. Uploads e backup"
if [ -d "./data/uploads" ]; then
  run du -sh ./data/uploads
  run find ./data/uploads -type f 2>/dev/null | wc -l
elif command -v docker >/dev/null 2>&1 && docker compose ps app 2>/dev/null | grep -q Up; then
  printf 'Uploads via container app (/app/data/uploads):\n'
  docker compose exec -T app sh -c 'du -sh /app/data/uploads 2>/dev/null; find /app/data/uploads -type f 2>/dev/null | wc -l' 2>/dev/null || true
else
  printf 'Pasta uploads não encontrada (host nem container app Up)\n'
fi
if [ -x scripts/backup-matilha.sh ]; then
  echo "scripts/backup-matilha.sh: presente e executável"
else
  echo "scripts/backup-matilha.sh: ausente ou sem +x"
fi
crClient="$(crontab -l 2>/dev/null | grep -i backup || true)"
if [ -n "$crClient" ]; then
  printf 'Cron backup:\n%s\n' "$crClient"
else
  echo "Cron backup: nenhuma entrada encontrada no crontab deste usuário"
fi

section "8. Serviços extras (host)"
for svc in nginx ollama; do
  if command -v "$svc" >/dev/null 2>&1 || systemctl is-active "$svc" >/dev/null 2>&1; then
  printf '%s: ' "$svc"
  systemctl is-active "$svc" 2>/dev/null || echo "binário presente"
  fi
done
if curl -sS -m 3 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
  echo "Ollama HTTP :11434: respondendo"
  curl -sS -m 5 "http://127.0.0.1:11434/api/tags" 2>/dev/null | head -c 500
  printf '\n'
else
  echo "Ollama HTTP :11434: não respondeu"
fi
if command -v ufw >/dev/null 2>&1; then
  run ufw status 2>/dev/null || true
fi

section "9. Logs recentes (app, últimas 25 linhas)"
if command -v docker >/dev/null 2>&1; then
  docker compose logs app --tail 25 2>&1 || true
fi

section "10. Portas em escuta (app stack)"
if command -v ss >/dev/null 2>&1; then
  ss -tlnp 2>/dev/null | grep -E ':3000|:5432|:6001|:7880|:3478|:11434' || echo "(nenhuma porta stack encontrada ou ss sem permissão)"
elif command -v netstat >/dev/null 2>&1; then
  netstat -tlnp 2>/dev/null | grep -E ':3000|:5432|:6001|:7880|:3478|:11434' || true
fi

section "11. Smoke tests (funcionalidades)"
SMOKE_EXIT=0
if [ -x scripts/server-smoke.sh ]; then
  scripts/server-smoke.sh || SMOKE_EXIT=$?
elif [ -f scripts/server-smoke.sh ]; then
  bash scripts/server-smoke.sh || SMOKE_EXIT=$?
else
  echo "scripts/server-smoke.sh não encontrado"
  SMOKE_EXIT=1
fi

hr
if [ "$SMOKE_EXIT" -eq 0 ]; then
  printf 'Fim do relatório — smoke tests OK.\n'
else
  printf 'Fim do relatório — ATENÇÃO: alguns smoke tests falharam (seção 11).\n'
fi
printf 'Envie este texto completo no chat. Não contém senhas do .env.\n'
printf 'Novos testes: edite scripts/smoke-tests.list (1 linha por feature).\n'
