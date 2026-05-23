# shellcheck shell=bash
# Funções compartilhadas — server-audit.sh, server-smoke.sh, setup-https-lan.sh

bc_hr() { printf '\n%s\n' "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }
bc_section() { bc_hr; printf '▶ %s\n' "$1"; bc_hr; }

bc_safe_env() {
  local key="$1"
  if [ -f .env ]; then
    local val
    val="$(grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r' || true)"
    if [ -z "$val" ]; then
      echo "(vazio ou ausente)"
    else
      echo "$val"
    fi
  else
    echo "(sem .env)"
  fi
}

bc_load_host() {
  BC_HOST="$(bc_safe_env BC_HOST)"
  if [ "$BC_HOST" = "(vazio ou ausente)" ] || [ "$BC_HOST" = "(sem .env)" ]; then
    BC_HOST="192.168.1.4"
  fi
  APP_PORT="${APP_PORT:-3000}"
  APP_URL_ENV="$(bc_safe_env APP_URL)"
  COOKIE_SECURE="$(bc_safe_env COOKIE_SECURE)"
  BASE_HTTP="http://${BC_HOST}:${APP_PORT}"
  if [ "$APP_URL_ENV" != "(vazio ou ausente)" ] && [ "$APP_URL_ENV" != "(sem .env)" ]; then
    BASE_HTTPS="${APP_URL_ENV}"
  else
    BASE_HTTPS="https://${BC_HOST}"
  fi
}

bc_run() {
  printf '$ %s\n' "$*"
  if "$@" 2>&1; then
    :
  else
    printf '(exit %s)\n' "$?"
  fi
}

bc_port_listener() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -tlnp 2>/dev/null | grep -E ":${port}[[:space:]]" || true
  elif command -v lsof >/dev/null 2>&1; then
    sudo lsof -i ":${port}" -sTCP:LISTEN 2>/dev/null || lsof -i ":${port}" -sTCP:LISTEN 2>/dev/null || true
  else
    echo "(ss/lsof indisponível)"
  fi
}

bc_port_in_use() {
  local port="$1"
  bc_port_listener "$port" | grep -q .
}

bc_probe_tcp() {
  local host="$1" port="$2" label="$3"
  if command -v nc >/dev/null 2>&1; then
    if nc -z -w 2 "$host" "$port" 2>/dev/null; then
      printf '  [OK]   %-32s %s:%s\n' "$label" "$host" "$port"
      return 0
    fi
  elif (echo >/dev/tcp/"$host"/"$port") 2>/dev/null; then
    printf '  [OK]   %-32s %s:%s\n' "$label" "$host" "$port"
    return 0
  fi
  printf '  [FAIL] %-32s %s:%s\n' "$label" "$host" "$port"
  return 1
}

bc_probe_https() {
  local url="$1" label="$2"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' -m 8 -k "$url" 2>/dev/null || echo 000)"
  if [ "$code" != "000" ] && [ "$code" -lt 500 ]; then
    printf '  [OK]   %-32s %s → HTTP %s\n' "$label" "$url" "$code"
    return 0
  fi
  printf '  [FAIL] %-32s %s → HTTP %s\n' "$label" "$url" "$code"
  return 1
}
