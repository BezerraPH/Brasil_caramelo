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

bc_safe_env_raw() {
  local key="$1"
  if [ -f .env ]; then
    grep -E "^${key}=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r' || true
  fi
}

bc_host_resolves() {
  local host="$1"
  [ -n "$host" ] && getent hosts "$host" >/dev/null 2>&1
}

bc_lan_ip() {
  local ip
  ip="$(bc_safe_env_raw BC_LAN_IP)"
  if [ -n "$ip" ]; then
    echo "$ip"
    return
  fi
  ip="$(bc_safe_env_raw BC_HOST)"
  if [ -n "$ip" ] && [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "$ip"
    return
  fi
  echo "192.168.1.4"
}

bc_load_host() {
  BC_HOST="$(bc_safe_env BC_HOST)"
  if [ "$BC_HOST" = "(vazio ou ausente)" ] || [ "$BC_HOST" = "(sem .env)" ]; then
    BC_HOST="192.168.1.4"
  fi
  BC_LAN_IP="$(bc_lan_ip)"
  APP_PORT="${APP_PORT:-3000}"
  APP_URL_ENV="$(bc_safe_env APP_URL)"
  if [ "$APP_URL_ENV" != "(vazio ou ausente)" ] && [ "$APP_URL_ENV" != "(sem .env)" ]; then
    BASE_HTTPS="${APP_URL_ENV%/}"
  else
    BASE_HTTPS="https://${BC_HOST}"
  fi
  BASE_HTTP="http://${BC_LAN_IP}:${APP_PORT}"
}

# URLs para smoke/audit no próprio servidor (DNS local pode não existir).
bc_load_smoke_urls() {
  bc_load_host
  SMOKE_CURL_EXTRA=()
  SMOKE_NOTE=""

  local app_url
  app_url="$(bc_safe_env_raw APP_URL)"

  if [[ "$app_url" == https://* ]]; then
    local vhost="${BC_HOST}"
    if bc_host_resolves "$vhost"; then
      SMOKE_BASE="${app_url%/}"
    else
      SMOKE_BASE="https://127.0.0.1"
      SMOKE_CURL_EXTRA=(-k -H "Host: ${vhost}")
      SMOKE_NOTE="(servidor sem DNS para ${vhost} — testes via 127.0.0.1 + Host; rode setup-https-lan.sh ou adicione /etc/hosts)"
    fi
  elif bc_host_resolves "$BC_HOST"; then
    SMOKE_BASE="http://${BC_HOST}:${APP_PORT}"
  else
    SMOKE_BASE="http://127.0.0.1:${APP_PORT}"
    SMOKE_NOTE="(hostname ${BC_HOST} não resolve neste servidor — testes via 127.0.0.1:${APP_PORT})"
  fi
}

# Garante que o servidor resolve brasilcaramelo.com (smoke/audit/curl).
bc_ensure_server_hosts() {
  local ip="${1:-$(bc_lan_ip)}"
  local name="${2:-brasilcaramelo.com}"
  if bc_host_resolves "$name"; then
    return 0
  fi
  echo "==> Adicionando ${name} em /etc/hosts (${ip})..."
  if ! grep -qE "[[:space:]]${name}([[:space:]]|$)" /etc/hosts 2>/dev/null; then
    echo "${ip}    ${name} www.${name}" | sudo tee -a /etc/hosts >/dev/null
  fi
  if bc_host_resolves "$name"; then
    echo "OK: ${name} resolve para $(getent hosts "$name" | awk '{print $1}')"
    return 0
  fi
  echo "AVISO: não foi possível resolver ${name} após editar /etc/hosts"
  return 1
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

bc_curl_smoke() {
  # Uso: bc_curl_smoke -sS -o file -w '%{http_code}' ... URL
  curl "${SMOKE_CURL_EXTRA[@]}" "$@"
}
