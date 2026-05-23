#!/bin/bash
# Runner de smoke tests — usado por server-report.sh ou standalone.
# Uso: ./scripts/server-smoke.sh
#      BC_SMOKE_EMAIL=... BC_SMOKE_PASSWORD=... ./scripts/server-smoke.sh
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

safe_env() {
  local key="$1"
  local val=""
  if [ -f .env ]; then
    val="$(grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r' || true)"
  fi
  printf '%s' "$val"
}

BC_HOST="$(safe_env BC_HOST)"
[ -z "$BC_HOST" ] && BC_HOST="192.168.1.4"
APP_PORT="${APP_PORT:-3000}"
BASE="http://${BC_HOST}:${APP_PORT}"

SMOKE_COOKIE="$(mktemp /tmp/bc-smoke-cookie.XXXXXX)"
SMOKE_BODY="$(mktemp /tmp/bc-smoke-body.XXXXXX)"
trap 'rm -f "$SMOKE_COOKIE" "$SMOKE_BODY"' EXIT

PASS=0
FAIL=0
SKIP=0

code_in_list() {
  local code="$1"
  local list="$2"
  local IFS=','
  for c in $list; do
    [ "$c" = "$code" ] && return 0
  done
  return 1
}

probe_tcp() {
  local host="$1" port="$2" label="$3"
  if command -v nc >/dev/null 2>&1; then
    if nc -z -w 2 "$host" "$port" 2>/dev/null; then
      printf '  [OK]   %-28s %s:%s\n' "$label" "$host" "$port"
      PASS=$((PASS + 1))
      return
    fi
  elif (echo >/dev/tcp/"$host"/"$port") 2>/dev/null; then
    printf '  [OK]   %-28s %s:%s\n' "$label" "$host" "$port"
    PASS=$((PASS + 1))
    return
  fi
  printf '  [FAIL] %-28s %s:%s (sem resposta TCP)\n' "$label" "$host" "$port"
  FAIL=$((FAIL + 1))
}

run_http_smoke() {
  local category="$1" name="$2" method="$3" path="$4" expect="$5" body_need="$6"
  local url="${BASE}${path}"
  local code

  if [ "$method" = "POST" ] && [ "$path" = "/api/auth/login" ] && [ -z "$body_need" ]; then
    code="$(curl -sS -o "$SMOKE_BODY" -w '%{http_code}' -m 12 \
      -X POST "$url" -H 'Content-Type: application/json' -d '{}' 2>/dev/null || echo 000)"
  else
    code="$(curl -sS -o "$SMOKE_BODY" -w '%{http_code}' -m 12 \
      -X "$method" "$url" ${SMOKE_USE_COOKIE:+-b "$SMOKE_COOKIE" -c "$SMOKE_COOKIE"} 2>/dev/null || echo 000)"
  fi

  if ! code_in_list "$code" "$expect"; then
    printf '  [FAIL] %-28s %s %s → HTTP %s (esperado %s)\n' "$name" "$method" "$path" "$code" "$expect"
    FAIL=$((FAIL + 1))
    return
  fi

  if [ -n "$body_need" ] && ! grep -qF "$body_need" "$SMOKE_BODY" 2>/dev/null; then
    printf '  [FAIL] %-28s %s %s → HTTP %s sem "%s" no corpo\n' "$name" "$method" "$path" "$code" "$body_need"
    FAIL=$((FAIL + 1))
    return
  fi

  printf '  [OK]   %-28s %s %s → HTTP %s\n' "$name" "$method" "$path" "$code"
  PASS=$((PASS + 1))
}

run_list_file() {
  local file="$1"
  local label="$2"
  [ -f "$file" ] || return

  printf '\n── %s (%s) ──\n' "$label" "$(basename "$file")"
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [ -z "$line" ] && continue

    IFS='|' read -r category name method path expect body_need <<< "$line"
    run_http_smoke "$category" "$name" "$method" "$path" "$expect" "${body_need:-}"
  done < "$file"
}

try_auth_login() {
  local email="${BC_SMOKE_EMAIL:-$(safe_env BC_SMOKE_EMAIL)}"
  local pass="${BC_SMOKE_PASSWORD:-$(safe_env BC_SMOKE_PASSWORD)}"

  if [ -z "$email" ] || [ -z "$pass" ]; then
    printf '\n── Sessão (smoke-tests-auth.list) ──\n'
    echo "  [SKIP] BC_SMOKE_EMAIL / BC_SMOKE_PASSWORD não definidos — pulando testes autenticados"
    SKIP=$((SKIP + 1))
    return 1
  fi

  local code
  code="$(curl -sS -o "$SMOKE_BODY" -w '%{http_code}' -m 15 \
    -c "$SMOKE_COOKIE" -b "$SMOKE_COOKIE" \
    -X POST "${BASE}/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${email}\",\"password\":\"${pass}\"}" 2>/dev/null || echo 000)"

  if [ "$code" != "200" ]; then
    printf '\n── Sessão (smoke-tests-auth.list) ──\n'
    printf '  [FAIL] Login smoke → HTTP %s (verifique BC_SMOKE_* no .env)\n' "$code"
    FAIL=$((FAIL + 1))
    return 1
  fi

  SMOKE_USE_COOKIE=1
  printf '\n── Sessão autenticada (%s) ──\n' "$(basename scripts/smoke-tests-auth.list)"
  return 0
}

printf 'SMOKE TESTS — %s\n' "$BASE"

printf '\n── Infraestrutura (portas TCP) ──\n'
probe_tcp "$BC_HOST" "$APP_PORT" "App Next.js"
probe_tcp "$BC_HOST" 6001 "Soketi"
probe_tcp "$BC_HOST" 7880 "LiveKit"
probe_tcp "$BC_HOST" 7881 "LiveKit RTC TCP"
probe_tcp "$BC_HOST" 3478 "coturn TURN"
probe_tcp "127.0.0.1" 5432 "PostgreSQL (localhost)"

if command -v nc >/dev/null 2>&1; then
  if nc -u -z -w 2 "$BC_HOST" 50000 2>/dev/null; then
    printf '  [OK]   %-28s %s:%s (UDP)\n' "LiveKit mídia UDP" "$BC_HOST" "50000"
    PASS=$((PASS + 1))
  else
    printf '  [SKIP] %-28s UDP %s:50000 (sem resposta — verifique firewall)\n' "LiveKit mídia UDP" "$BC_HOST"
    SKIP=$((SKIP + 1))
  fi
else
  printf '  [SKIP] %-28s nc ausente\n' "LiveKit mídia UDP"
  SKIP=$((SKIP + 1))
fi

PUSHER_HOST="$(safe_env PUSHER_HOST)"
if [ "$PUSHER_HOST" = "soketi" ] && command -v docker >/dev/null 2>&1; then
  if docker compose exec -T soketi wget -q -O- http://127.0.0.1:6001/ 2>/dev/null | head -c 1 >/dev/null; then
    printf '  [OK]   %-28s container soketi\n' "Soketi HTTP interno"
    PASS=$((PASS + 1))
  fi
fi

OLLAMA_URL="$(safe_env OLLAMA_BASE_URL)"
if [ -n "$OLLAMA_URL" ]; then
  if curl -sS -m 5 "${OLLAMA_URL%/}/api/tags" >/dev/null 2>&1; then
    printf '  [OK]   %-28s %s\n' "Ollama" "$OLLAMA_URL"
    PASS=$((PASS + 1))
  else
    printf '  [FAIL] %-28s %s (sem resposta)\n' "Ollama" "$OLLAMA_URL"
    FAIL=$((FAIL + 1))
  fi
else
  printf '  [SKIP] %-28s OLLAMA_BASE_URL vazio\n' "Ollama"
  SKIP=$((SKIP + 1))
fi

if command -v docker >/dev/null 2>&1 && docker compose ps --status running app 2>/dev/null | grep -q .; then
  if docker compose exec -T app sh -c 'ffmpeg -version 2>&1 | head -1' 2>/dev/null | grep -qi ffmpeg; then
    printf '  [OK]   %-28s ffmpeg no container\n' "Transcode vídeo"
    PASS=$((PASS + 1))
  else
    printf '  [FAIL] %-28s ffmpeg ausente no container app\n' "Transcode vídeo"
    FAIL=$((FAIL + 1))
  fi
fi

run_list_file "scripts/smoke-tests.list" "HTTP sem login"

if try_auth_login; then
  run_list_file "scripts/smoke-tests-auth.list" "HTTP com login"
fi

printf '\n── Resumo ──\n'
printf '  OK: %s  |  FAIL: %s  |  SKIP: %s\n' "$PASS" "$FAIL" "$SKIP"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
