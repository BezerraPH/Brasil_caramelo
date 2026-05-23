#!/bin/bash
# Cria (ou verifica) conta dedicada para smoke tests no servidor LAN.
# Uso: ./scripts/setup-smoke-account.sh
# Depois: ./scripts/server-smoke.sh  ou  ./scripts/server-report.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

safe_env() {
  local key="$1"
  if [ -f .env ]; then
    grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'"
  fi
}

BC_HOST="$(safe_env BC_HOST)"
[ -z "$BC_HOST" ] && BC_HOST="192.168.1.4"
BASE="http://${BC_HOST}:3000"

EMAIL="${BC_SMOKE_EMAIL:-$(safe_env BC_SMOKE_EMAIL)}"
SMOKE_USER="${BC_SMOKE_USERNAME:-$(safe_env BC_SMOKE_USERNAME)}"
PASS="${BC_SMOKE_PASSWORD:-$(safe_env BC_SMOKE_PASSWORD)}"
NAME="${BC_SMOKE_NAME:-Conta Smoke Test}"

# Defaults só no servidor (LAN); troque no .env se quiser.
[ -z "$EMAIL" ] && EMAIL="smoke-test@example.com"
[ -z "$SMOKE_USER" ] && SMOKE_USER="smoke_test"
[ -z "$PASS" ] && PASS="SmokeMatilha2026!"

append_env_once() {
  local key="$1" val="$2"
  if [ ! -f .env ]; then
    echo "Erro: .env não encontrado. Rode ./scripts/setup-env.sh primeiro."
    exit 1
  fi
  if grep -qE "^${key}=" .env 2>/dev/null; then
    return
  fi
  NEEDS_SMOKE_BLOCK=1
  SMOKE_ENV_LINES+=("${key}=${val}")
}

NEEDS_SMOKE_BLOCK=0
SMOKE_ENV_LINES=()

echo "==> Conta smoke — ${BASE}"
echo "    e-mail:  ${EMAIL}"
echo "    usuário: ${SMOKE_USER}"

REGISTER_CODE="$(curl -sS -o /tmp/bc-smoke-reg.json -w '%{http_code}' -m 15 \
  -X POST "${BASE}/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"${NAME}\",\"username\":\"${SMOKE_USER}\",\"email\":\"${EMAIL}\",\"password\":\"${PASS}\"}" 2>/dev/null || echo 000)"

case "$REGISTER_CODE" in
  200|201)
    echo "    ✓ Conta criada via /api/auth/register"
    ;;
  409)
    echo "    · Conta já existe — verificando login…"
    ;;
  *)
    echo "    ✗ Cadastro retornou HTTP ${REGISTER_CODE}"
    cat /tmp/bc-smoke-reg.json 2>/dev/null || true
    echo ""
    echo "    Crie manualmente em ${BASE}/cadastro ou ajuste BC_SMOKE_* no .env"
    exit 1
    ;;
esac

LOGIN_CODE="$(curl -sS -o /tmp/bc-smoke-login.json -w '%{http_code}' -m 15 \
  -X POST "${BASE}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASS}\"}" 2>/dev/null || echo 000)"

if [ "$LOGIN_CODE" != "200" ]; then
  echo "    ✗ Login falhou (HTTP ${LOGIN_CODE}) — senha no .env diferente da conta?"
  cat /tmp/bc-smoke-login.json 2>/dev/null || true
  exit 1
fi

echo "    ✓ Login OK"

append_env_once "BC_SMOKE_EMAIL" "$EMAIL"
append_env_once "BC_SMOKE_PASSWORD" "$PASS"
append_env_once "BC_SMOKE_USERNAME" "$SMOKE_USER"

if [ "$NEEDS_SMOKE_BLOCK" -eq 1 ]; then
  {
    printf '\n# Conta smoke (scripts/setup-smoke-account.sh)\n'
    for line in "${SMOKE_ENV_LINES[@]}"; do
      printf '%s\n' "$line"
    done
  } >> .env
fi

echo ""
echo "Pronto. Rode os testes autenticados:"
echo "  ./scripts/server-smoke.sh"
echo "  ./scripts/server-report.sh"
echo ""
echo "Esta conta é só para diagnóstico na LAN — não use como conta pessoal."
